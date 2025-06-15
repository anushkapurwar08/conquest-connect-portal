
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import MentorCategoryTabs from '@/components/mentor/MentorCategoryTabs';
import DirectChat from '@/components/chat/DirectChat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AvailableSlot {
  id: string;
  start_time: string;
  end_time: string;
  mentor_id: string;
  mentor_name: string;
  mentor_type: string;
}

const StartupMentorChat: React.FC = () => {
  const { profile } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<{ id: string; type: string; name: string } | null>(null);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [showSlots, setShowSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
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
        setLoading(false);
        return;
      }

      if (!startup) {
        console.log('No startup record found for profile:', profile.id);
        setError('No startup record found. Please ensure your account is set up with startup information.');
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

  const fetchMentorSlots = async (mentorId: string) => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          id,
          start_time,
          end_time,
          mentor_id,
          mentors!inner(
            mentor_type,
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('mentor_id', mentorId)
        .eq('status', 'available')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching mentor slots:', error);
        return;
      }

      const formattedSlots: AvailableSlot[] = data?.map((slot: any) => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        mentor_id: slot.mentor_id,
        mentor_type: slot.mentors?.mentor_type || 'expert',
        mentor_name: slot.mentors?.profiles?.first_name && slot.mentors?.profiles?.last_name
          ? `${slot.mentors.profiles.first_name} ${slot.mentors.profiles.last_name}`
          : slot.mentors?.profiles?.username || 'Unknown Mentor'
      })) || [];

      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching mentor slots:', error);
    }
  };

  const fetchMentorName = async (mentorId: string) => {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          profiles!inner(
            first_name,
            last_name,
            username
          )
        `)
        .eq('id', mentorId)
        .single();

      if (error || !data) {
        console.error('Error fetching mentor name:', error);
        return 'Unknown Mentor';
      }

      const profile = data.profiles;
      if (profile.first_name && profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`;
      }
      return profile.username;
    } catch (error) {
      console.error('Error fetching mentor name:', error);
      return 'Unknown Mentor';
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
    
    // Get mentor name
    const mentorName = await fetchMentorName(mentorId);
    
    setSelectedMentor({ id: mentorId, type: mentorType, name: mentorName });
    
    // Fetch available slots for this mentor
    await fetchMentorSlots(mentorId);
  };

  const handleBookSlot = async (slotId: string) => {
    if (!startupId) {
      toast({
        title: "Error",
        description: "Startup profile not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      const slot = availableSlots.find(s => s.id === slotId);
      if (!slot) return;

      const { error } = await supabase
        .from('appointments')
        .insert({
          startup_id: startupId,
          mentor_id: slot.mentor_id,
          time_slot_id: slotId,
          scheduled_at: slot.start_time,
          title: 'Mentoring Session',
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Session Booked",
        description: `Your session with ${slot.mentor_name} has been scheduled successfully.`,
      });

      // Refresh slots
      await fetchMentorSlots(slot.mentor_id);
    } catch (error) {
      console.error('Error booking slot:', error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToMentors = () => {
    setSelectedMentor(null);
    setShowSlots(false);
    setAvailableSlots([]);
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
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={showSlots ? "default" : "outline"}
              onClick={() => setShowSlots(!showSlots)}
              className={showSlots ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              {showSlots ? "Hide Slots" : "View Available Slots"}
            </Button>
          </div>
        </div>

        {showSlots && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Available Time Slots</CardTitle>
              <CardDescription>Book a session with this mentor</CardDescription>
            </CardHeader>
            <CardContent>
              {availableSlots.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No available slots at the moment
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          {new Date(slot.start_time).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">
                          {new Date(slot.start_time).toLocaleTimeString()} - 
                          {new Date(slot.end_time).toLocaleTimeString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleBookSlot(slot.id)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        Book This Slot
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <DirectChat
          otherUserId={selectedMentor.id}
          otherUserName={selectedMentor.name}
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
