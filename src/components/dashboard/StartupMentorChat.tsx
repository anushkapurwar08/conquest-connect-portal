
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import MentorCategoryTabs from '@/components/mentor/MentorCategoryTabs';
import SimpleChatFollowUp from './SimpleChatFollowUp';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const StartupMentorChat: React.FC = () => {
  const { profile } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<{ id: string; type: string } | null>(null);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchStartupId();
    }
  }, [profile?.id]);

  const fetchStartupId = async () => {
    if (!profile?.id) {
      setError('No profile found. Please ensure you are logged in.');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching startup ID for profile:', profile.id);

      const { data: startup, error } = await supabase
        .from('startups')
        .select('id, startup_name')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching startup:', error);
        setError(`Database error: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to load startup profile. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!startup) {
        console.log('No startup record found for profile:', profile.id);
        setError('No startup record found. Please ensure your account is set up with startup information.');
        toast({
          title: "Startup Profile Not Found",
          description: "Your account is not set up with startup information. Please complete your startup profile first.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Found startup:', startup);
      setStartupId(startup.id);
      setError(null);
    } catch (error) {
      console.error('Error fetching startup ID:', error);
      setError('An unexpected error occurred while loading your startup profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentor = async (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    if (!startupId) {
      toast({
        title: "Error",
        description: "Startup profile not found. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    console.log('Selected mentor:', mentorId, 'type:', mentorType);
    
    // Verify mentor exists and has proper profile linkage
    try {
      const { data: mentor, error } = await supabase
        .from('mentors')
        .select(`
          id,
          mentor_type,
          profile_id,
          profiles!inner(
            first_name,
            last_name,
            username
          )
        `)
        .eq('id', mentorId)
        .maybeSingle();

      if (error || !mentor) {
        console.error('Error verifying mentor:', error);
        toast({
          title: "Error",
          description: "Selected mentor is not available. Please try another mentor.",
          variant: "destructive"
        });
        return;
      }

      console.log('Verified mentor:', mentor);
      setSelectedMentor({ id: mentorId, type: mentorType });
    } catch (error) {
      console.error('Error verifying mentor:', error);
      toast({
        title: "Error",
        description: "Failed to verify mentor. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToMentors = () => {
    setSelectedMentor(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your startup profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Unable to Load Mentor Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-600">{error}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>Profile ID: {profile?.id || 'Not found'}</p>
              <p>Profile Role: {profile?.role || 'Not found'}</p>
              <p>Startup ID: {startupId || 'Not found'}</p>
            </div>
            <Button 
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchStartupId();
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedMentor && startupId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToMentors}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Back to Mentors
          </button>
        </div>
        <SimpleChatFollowUp
          userRole="startup"
          mentorId={selectedMentor.id}
          startupId={startupId}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect with Mentors</CardTitle>
        <CardDescription>
          Choose a mentor category and start a conversation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MentorCategoryTabs
          onSelectMentor={handleSelectMentor}
          selectedMentorId={selectedMentor?.id}
        />
      </CardContent>
    </Card>
  );
};

export default StartupMentorChat;
