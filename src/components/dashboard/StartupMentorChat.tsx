
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import MentorCategoryTabs from '@/components/mentor/MentorCategoryTabs';
import SimpleChatFollowUp from './SimpleChatFollowUp';

const StartupMentorChat: React.FC = () => {
  const { profile } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<{
    id: string;
    type: 'founder_mentor' | 'expert' | 'coach';
  } | null>(null);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchOrCreateStartupProfile();
    }
  }, [profile?.id]);

  const fetchOrCreateStartupProfile = async () => {
    if (!profile?.id) return;

    try {
      console.log('Fetching startup profile for user:', profile.id);
      
      // First try to find existing startup profile
      const { data: existingStartup, error: fetchError } = await supabase
        .from('startups')
        .select('id, startup_name')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (existingStartup) {
        console.log('Found existing startup:', existingStartup);
        setStartupId(existingStartup.id);
        setLoading(false);
        return;
      }

      console.log('No existing startup found, creating new one');
      
      // If no startup exists, create one
      const { data: newStartup, error: createError } = await supabase
        .from('startups')
        .insert({
          profile_id: profile.id,
          startup_name: profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}'s Startup`
            : `${profile.username}'s Startup`,
          description: 'New startup looking for mentorship',
          stage: 'idea'
        })
        .select('id, startup_name')
        .single();

      if (createError) {
        console.error('Error creating startup profile:', createError);
        toast({
          title: "Profile Error",
          description: "Could not create startup profile. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Created new startup:', newStartup);
      setStartupId(newStartup.id);
      
      toast({
        title: "Profile Created",
        description: "Your startup profile has been created successfully.",
      });
    } catch (error) {
      console.error('Unexpected error with startup profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentor = (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    console.log('Selected mentor:', { mentorId, mentorType, startupId });
    
    if (!startupId) {
      toast({
        title: "Profile Required",
        description: "Please wait for your startup profile to be created.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedMentor({ id: mentorId, type: mentorType });
  };

  const handleBackToMentors = () => {
    setSelectedMentor(null);
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to access chat functionality.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Setting up your profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedMentor && startupId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToMentors}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Mentors</span>
          </Button>
          <div className="text-sm text-muted-foreground">
            Chatting with {selectedMentor.type.replace('_', ' ')} mentor
          </div>
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
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Connect with Mentors</span>
        </CardTitle>
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
