
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MentorCategoryTabs from '@/components/mentor/MentorCategoryTabs';
import SimpleChatFollowUp from './SimpleChatFollowUp';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const StartupMentorChat: React.FC = () => {
  const { profile } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<{ id: string; type: string } | null>(null);
  const [startupId, setStartupId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchStartupId();
    }
  }, [profile?.id]);

  const fetchStartupId = async () => {
    if (!profile?.id) return;

    try {
      const { data: startup, error } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching startup:', error);
        return;
      }

      if (startup) {
        setStartupId(startup.id);
      }
    } catch (error) {
      console.error('Error fetching startup ID:', error);
    }
  };

  const handleSelectMentor = (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    console.log('Selected mentor:', mentorId, 'type:', mentorType);
    setSelectedMentor({ id: mentorId, type: mentorType });
  };

  const handleBackToMentors = () => {
    setSelectedMentor(null);
  };

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
