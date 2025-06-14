
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
      fetchFullProfile(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFullProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profileData) {
        const fullProfile: Profile = {
          id: profileData.id,
          username: profileData.username,
          role: profileData.role,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          title: profileData.title,
          company: profileData.company,
          expertise: profileData.expertise,
          bio: profileData.bio,
          profile_image_url: profileData.profile_image_url
        };

        setProfile(fullProfile);
        setUser(fullProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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

      console.log('Credentials verified, creating auth session');

      // Create a temporary email for Supabase auth using the user ID
      const tempEmail = `${credentials.id}@conquest-temp.com`;
      const tempPassword = credentials.id; // Use the ID as password for consistency

      try {
        // Try to sign in with existing Supabase user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: tempPassword,
        });

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          console.log('Supabase user does not exist, creating one...');
          
          // Create a new Supabase user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: tempEmail,
            password: tempPassword,
            options: {
              data: {
                username: credentials.username,
                role: credentials.role,
                profile_id: credentials.id
              }
            }
          });

          if (signUpError) {
            console.error('Error creating Supabase user:', signUpError);
            throw new Error('Failed to create authentication session');
          }

          console.log('Supabase user created successfully');
        } else if (signInError) {
          console.error('Error signing in to Supabase:', signInError);
          throw new Error('Failed to create authentication session');
        }

        console.log('Supabase auth session established');
      } catch (authError) {
        console.error('Supabase auth error:', authError);
        // Continue with local auth even if Supabase auth fails
      }

      // Fetch full profile data
      await fetchFullProfile(credentials.id);

      // Save basic user data to localStorage for persistence
      const basicUserData = {
        id: credentials.id,
        username: credentials.username,
        role: credentials.role
      };

      localStorage.setItem('conquest_user', JSON.stringify(basicUserData));

      return { user: basicUserData };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
    
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
