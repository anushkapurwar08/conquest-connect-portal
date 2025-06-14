
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  username: string;
  role: 'startup' | 'mentor' | 'team';
  startup_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  expertise?: string[];
  bio?: string;
  profile_image_url?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('conquest_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setProfile(userData);
    }
    setLoading(false);
  }, []);

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

      console.log('Credentials verified, creating user session');

      // Create user object
      const userData = {
        id: credentials.id,
        username: credentials.username,
        role: credentials.role,
        startup_name: credentials.startup_name,
        first_name: null,
        last_name: null,
        title: null,
        company: null,
        expertise: null,
        bio: null,
        profile_image_url: null
      };

      // Save to localStorage for persistence
      localStorage.setItem('conquest_user', JSON.stringify(userData));

      setUser(userData);
      setProfile(userData);

      return { user: userData };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('conquest_user');
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    signInWithCredentials,
    signOut
  };
};
