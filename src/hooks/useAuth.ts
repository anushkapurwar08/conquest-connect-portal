
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
        .eq('is_active', true)
        .maybeSingle();

      console.log('Credentials query result:', { credentials, credError });

      if (credError) {
        console.error('Database error:', credError);
        throw new Error('Database error occurred');
      }

      if (!credentials) {
        console.log('No credentials found for username:', username);
        throw new Error('Invalid credentials');
      }

      // Check password - the stored hash is just the password for demo purposes
      // Extract actual password from the stored hash format
      const expectedPassword = extractPasswordFromHash(credentials.password_hash, credentials.username);
      console.log('Expected password for', credentials.username, ':', expectedPassword);
      console.log('Provided password:', password);
      
      if (password !== expectedPassword) {
        console.log('Password mismatch');
        throw new Error('Invalid credentials');
      }

      console.log('Password verified, proceeding with Supabase auth');

      // Create or sign in user with Supabase Auth
      const email = `${username}@conquest.local`;
      const supabasePassword = `${username}_${password}`;
      
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

  // Helper function to extract password from stored hash
  const extractPasswordFromHash = (hash: string, username: string) => {
    // The stored hashes are in format: password_hash (e.g., "admin_hash", "doe_hash")
    // We need to extract the actual password
    const passwordMap: { [key: string]: string } = {
      'admin_hash': 'admin',
      'doe_hash': 'doe',
      'smith_hash': 'smith',
      'techflow_refcode_hash': 'techflow_refcode',
      'greenstart_refcode_hash': 'greenstart_refcode',
      'mentor123_hash': 'mentor123',
      'mentor456_hash': 'mentor456'
    };
    
    return passwordMap[hash] || '';
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
