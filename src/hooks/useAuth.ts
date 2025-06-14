
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
      // Check credentials in our custom auth table
      const { data: credentials, error: credError } = await supabase
        .from('auth_credentials')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (credError || !credentials) {
        throw new Error('Invalid credentials');
      }

      // For now, we'll use a simple password comparison
      // In production, you'd want to hash and compare properly
      const isValidPassword = password === getPasswordFromHash(credentials.password_hash, credentials.username);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Create or sign in user with Supabase Auth
      const email = `${username}@conquest.local`;
      
      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: `${username}_${password}` // Use a combination as password
      });

      // If sign in fails, try to sign up
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: `${username}_${password}`,
          options: {
            data: {
              username: credentials.username,
              role: credentials.role,
              startup_name: credentials.startup_name
            }
          }
        });

        if (signUpError) throw signUpError;
        signInData = signUpData;
      } else if (signInError) {
        throw signInError;
      }

      if (signInData.user) {
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

  // Helper function to extract password from our demo hash
  const getPasswordFromHash = (hash: string, username: string) => {
    // This is a simplified version for demo purposes
    // In production, you'd use proper bcrypt comparison
    const passwordMap: { [key: string]: string } = {
      'techflow_conquest': 'techflow_refcode',
      'greenstart_conquest': 'greenstart_refcode',
      'john': 'doe',
      'jane': 'smith',
      'admin': 'admin',
      'mentor1': 'mentor123',
      'johnsmith': 'mentor456'
    };
    return passwordMap[username] || '';
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
