
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
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
        return '👥';
      case 'coach':
        return '🎯';
      case 'expert':
        return '🎓';
      default:
        return '👤';
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

  const groupSlotsByDate = () => {
    const grouped = slots.reduce((acc, slot) => {
      const date = new Date(slot.start_time).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
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

  const groupedSlots = groupSlotsByDate();
  const dates = Object.keys(groupedSlots).sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Sessions</CardTitle>
          <CardDescription>
            Book mentoring sessions with available mentors
          </CardDescription>
        </CardHeader>
      </Card>

      {dates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No available sessions at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for new mentor availability
            </p>
          </CardContent>
        </Card>
      ) : (
        dates.map((date) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span>{new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <Badge variant="secondary">{groupedSlots[date].length} slots</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedSlots[date].map((slot) => (
                  <div key={slot.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{slot.mentor_name}</h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">{getMentorTypeIcon(slot.mentor_type)}</span>
                        <Badge variant="outline" className="text-xs">
                          {getMentorTypeLabel(slot.mentor_type)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>
                        {new Date(slot.start_time).toLocaleTimeString()} - 
                        {new Date(slot.end_time).toLocaleTimeString()}
                      </span>
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
        ))
      )}
    </div>
  );
};

export default CallScheduler;
