
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  role: 'startup' | 'mentor' | 'team';
  verified_id?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  expertise?: string[];
  bio?: string;
  profile_image_url?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signInWithCredentials = async (username: string, password: string) => {
    try {
      console.log('Attempting login for username:', username);
      
      // Check credentials in our custom auth table
      const { data: credentials, error: credError } = await supabase
        .from('auth_credentials')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      console.log('Credentials query result:', { credentials, credError });

      if (credError || !credentials) {
        console.log('Invalid credentials');
        throw new Error('Invalid username or password');
      }

      console.log('Credentials verified, proceeding with Supabase auth');

      // Create or sign in user with Supabase Auth
      const email = `${username}@conquest.local`;
      const supabasePassword = `${username}_conquest_2024`;
      
      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: supabasePassword
      });

      console.log('Supabase sign in result:', { signInData, signInError });

      // If sign in fails, try to sign up
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('Sign in failed, attempting sign up');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: supabasePassword,
          options: {
            data: {
              username: credentials.username,
              role: credentials.role,
              startup_name: credentials.startup_name
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          throw signUpError;
        }
        signInData = signUpData;
      } else if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (signInData.user) {
        console.log('Creating/updating profile for user:', signInData.user.id);
        // Create or update profile
        await createOrUpdateProfile(signInData.user.id, credentials);
      }

      return { user: signInData.user };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const createOrUpdateProfile = async (userId: string, credentials: any) => {
    const profileData = {
      user_id: userId,
      username: credentials.username,
      role: credentials.role,
      verified_id: credentials.username,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' });

    if (error) {
      console.error('Error creating/updating profile:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    profile,
    loading,
    signInWithCredentials,
    signOut
  };
};
