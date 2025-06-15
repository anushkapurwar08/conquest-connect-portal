
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  mentor_id: string;
  mentor_name: string;
  mentor_type: 'founder_mentor' | 'expert' | 'coach';
}

interface CallSchedulerProps {
  userRole: 'startup' | 'mentor';
}

const CallScheduler: React.FC<CallSchedulerProps> = ({ userRole }) => {
  const { profile } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [startupId, setStartupId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id && userRole === 'startup') {
      fetchStartupId();
    }
  }, [profile?.id, userRole]);

  useEffect(() => {
    if (startupId || userRole === 'mentor') {
      fetchAvailableSlots();
    }
  }, [startupId, userRole]);

  const fetchStartupId = async () => {
    try {
      const { data: startup, error } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .maybeSingle();

      if (error) throw error;
      if (startup) {
        setStartupId(startup.id);
      }
    } catch (error) {
      console.error('Error fetching startup ID:', error);
    }
  };

  const fetchAvailableSlots = async () => {
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
        .eq('status', 'available')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      const formattedSlots: TimeSlot[] = data?.map((slot: any) => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        mentor_id: slot.mentor_id,
        mentor_type: slot.mentors?.mentor_type || 'expert',
        mentor_name: slot.mentors?.profiles?.first_name && slot.mentors?.profiles?.last_name
          ? `${slot.mentors.profiles.first_name} ${slot.mentors.profiles.last_name}`
          : slot.mentors?.profiles?.username || 'Unknown Mentor'
      })) || [];

      setSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
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
      const slot = slots.find(s => s.id === slotId);
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
      await fetchAvailableSlots();
    } catch (error) {
      console.error('Error booking slot:', error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMentorTypeIcon = (type: string) => {
    switch (type) {
      case 'founder_mentor':
        return <Users className="h-4 w-4" />;
      case 'coach':
        return <Target className="h-4 w-4" />;
      case 'expert':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getMentorTypeLabel = (type: string) => {
    switch (type) {
      case 'founder_mentor':
        return 'Founder Mentor';
      case 'coach':
        return 'Coach';
      case 'expert':
        return 'Expert';
      default:
        return 'Expert';
    }
  };

  const groupSlotsByMentorType = () => {
    const grouped = slots.reduce((acc, slot) => {
      if (!acc[slot.mentor_type]) {
        acc[slot.mentor_type] = [];
      }
      acc[slot.mentor_type].push(slot);
      return acc;
    }, {} as Record<string, TimeSlot[]>);

    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading available sessions...</p>
        </CardContent>
      </Card>
    );
  }

  const groupedSlots = groupSlotsByMentorType();
  const mentorTypes = ['founder_mentor', 'coach', 'expert'] as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Sessions</CardTitle>
          <CardDescription>
            Book mentoring sessions organized by mentor type
          </CardDescription>
        </CardHeader>
      </Card>

      {mentorTypes.map((mentorType) => {
        const typeSlots = groupedSlots[mentorType] || [];
        
        if (typeSlots.length === 0) {
          return (
            <Card key={mentorType}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getMentorTypeIcon(mentorType)}
                  <span>{getMentorTypeLabel(mentorType)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  No available slots for {getMentorTypeLabel(mentorType).toLowerCase()}s
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={mentorType}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getMentorTypeIcon(mentorType)}
                <span>{getMentorTypeLabel(mentorType)}</span>
                <Badge variant="secondary">{typeSlots.length} slots</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {typeSlots.map((slot) => (
                  <div key={slot.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{slot.mentor_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getMentorTypeLabel(slot.mentor_type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span>{new Date(slot.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>
                          {new Date(slot.start_time).toLocaleTimeString()} - 
                          {new Date(slot.end_time).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {userRole === 'startup' && (
                      <Button
                        size="sm"
                        onClick={() => handleBookSlot(slot.id)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        Book Session
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {slots.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No available sessions at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for new mentor availability
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CallScheduler;
