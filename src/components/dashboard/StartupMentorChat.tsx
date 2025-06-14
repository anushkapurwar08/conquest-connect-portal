
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MentorCategoryTabs from '@/components/mentor/MentorCategoryTabs';
import SimpleChatFollowUp from './SimpleChatFollowUp';

const StartupMentorChat: React.FC = () => {
  const { profile } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<{
    id: string;
    type: 'founder_mentor' | 'expert' | 'coach';
  } | null>(null);

  // Get startup ID from profile (assuming startups table links to profile)
  const startupId = profile?.id; // This should be fetched from startups table in real app

  const handleSelectMentor = (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    console.log('Selected mentor:', { mentorId, mentorType, startupId });
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

  if (selectedMentor) {
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
