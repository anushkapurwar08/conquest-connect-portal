
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectMentor = async (mentorProfileId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Profile not found. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    console.log('Selected mentor profile:', mentorProfileId, 'type:', mentorType);
    setLoading(true);
    
    try {
      // Check if conversation exists between this startup and mentor
      const { data: existingConversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(mentor_id.eq.${mentorProfileId},startup_id.eq.${profile.id}),and(mentor_id.eq.${profile.id},startup_id.eq.${mentorProfileId})`)
        .maybeSingle();

      if (convError) {
        console.error('Error checking for existing conversation:', convError);
        throw new Error('Failed to check for existing conversation');
      }

      let finalConversationId = existingConversation?.id;

      // If no conversation exists, create one
      if (!finalConversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            mentor_id: mentorProfileId,
            startup_id: profile.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          throw new Error('Failed to create conversation');
        }

        finalConversationId = newConversation.id;
      }

      setConversationId(finalConversationId);
      setSelectedMentor({ id: mentorProfileId, type: mentorType });
      setError(null);
    } catch (error) {
      console.error('Error setting up conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMentors = () => {
    setSelectedMentor(null);
    setConversationId(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Setting up conversation...</p>
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
            <Button 
              onClick={() => {
                setError(null);
                setSelectedMentor(null);
                setConversationId(null);
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedMentor && conversationId) {
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
          conversationId={conversationId}
          otherProfileId={selectedMentor.id}
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
