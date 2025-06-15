
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useSchedulingRules } from '@/hooks/useSchedulingRules';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  mentor_id: string;
  mentor_name: string;
  mentor_type: string;
  is_available: boolean;
  status: string;
}

interface UpcomingCall {
  id: string;
  date: string;
  time: string;
  participant: string;
  status: string;
}

const StartupCallScheduler: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<UpcomingCall[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile, user } = useAuth();
  const { canBookSlot, isWithinBookingWindow, loading: rulesLoading } = useSchedulingRules();

  useEffect(() => {
    if (profile) {
      fetchAvailableSlots();
    }
    fetchUpcomingCalls();
  }, [profile]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      const { data: slotsData, error } = await supabase
        .from('time_slots')
        .select(`
          id,
          start_time,
          end_time,
          mentor_id,
          is_available,
          status,
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

      if (error) {
        console.error('Error fetching slots:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available slots. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (slotsData) {
        const formattedSlots: TimeSlot[] = slotsData.map((slot: any) => ({
          id: slot.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          mentor_id: slot.mentor_id,
          is_available: slot.is_available,
          status: slot.status,
          mentor_type: slot.mentors?.mentor_type || 'expert',
          mentor_name: slot.mentors?.profiles?.first_name && slot.mentors?.profiles?.last_name
            ? `${slot.mentors.profiles.first_name} ${slot.mentors.profiles.last_name}`
            : slot.mentors?.profiles?.username || 'Unknown Mentor'
        }));

        setAvailableSlots(formattedSlots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available slots. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingCalls = async () => {
    try {
      const { data: startup } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();
      
      if (!startup) return;

      const { data: callsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          status,
          title,
          mentors!inner(
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('startup_id', startup.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming calls:', error);
        return;
      }

      if (callsData) {
        const formattedCalls: UpcomingCall[] = callsData.map((call: any) => {
          const participant = call.mentors?.profiles?.first_name && call.mentors?.profiles?.last_name
            ? `${call.mentors.profiles.first_name} ${call.mentors.profiles.last_name}`
            : call.mentors?.profiles?.username || 'Unknown Mentor';

          return {
            id: call.id,
            date: new Date(call.scheduled_at).toLocaleDateString(),
            time: new Date(call.scheduled_at).toLocaleTimeString(),
            participant,
            status: call.status
          };
        });
        setUpcomingCalls(formattedCalls);
      }
    } catch (error) {
      console.error('Error fetching upcoming calls:', error);
    }
  };

  const handleScheduleSlot = async (slot: TimeSlot) => {
    try {
      if (!canBookSlot(slot.mentor_type as any, new Date(slot.start_time))) {
        toast({
          title: "Booking Unavailable",
          description: "This slot cannot be booked at this time. Please check booking window restrictions.",
          variant: "destructive"
        });
        return;
      }

      const { data: startup } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!startup) {
        toast({
          title: "Error",
          description: "Startup profile not found.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .insert({
          startup_id: startup.id,
          mentor_id: slot.mentor_id,
          time_slot_id: slot.id,
          scheduled_at: slot.start_time,
          title: 'Mentoring Session',
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Call Scheduled",
        description: `Your call with ${slot.mentor_name} has been scheduled successfully.`,
      });

      fetchUpcomingCalls();
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({
        title: "Error",
        description: "Failed to schedule the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const groupSlotsByMentorType = (slots: TimeSlot[]) => {
    const grouped = {
      coach: slots.filter(slot => slot.mentor_type === 'coach'),
      founder_mentor: slots.filter(slot => slot.mentor_type === 'founder_mentor'),
      expert: slots.filter(slot => slot.mentor_type === 'expert')
    };
    return grouped;
  };

  const renderBookingWindowStatus = () => {
    const withinWindow = isWithinBookingWindow();
    
    return (
      <div className={`p-3 rounded-lg mb-4 ${withinWindow ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className={`h-4 w-4 ${withinWindow ? 'text-green-600' : 'text-orange-600'}`} />
          <span className={`text-sm font-medium ${withinWindow ? 'text-green-800' : 'text-orange-800'}`}>
            {withinWindow ? 'Booking Window Open' : 'Booking Window Closed'}
          </span>
        </div>
        <p className={`text-xs mt-1 ${withinWindow ? 'text-green-600' : 'text-orange-600'}`}>
          {withinWindow 
            ? 'You can book available slots now.'
            : 'Slots can only be booked during active booking windows.'
          }
        </p>
      </div>
    );
  };

  const renderMentorTypeSlots = (mentorType: 'coach' | 'founder_mentor' | 'expert', slots: TimeSlot[]) => {
    const typeLabels = {
      coach: 'Coaches',
      founder_mentor: 'Founder Mentors',
      expert: 'Experts'
    };

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-orange-600">{typeLabels[mentorType]}</h3>
        {slots.length === 0 ? (
          <p className="text-muted-foreground text-center py-4 border rounded-lg">
            No available slots for {typeLabels[mentorType].toLowerCase()}
          </p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm font-medium">{slot.mentor_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(slot.start_time), 'MMM dd, yyyy')} • {' '}
                    {new Date(slot.start_time).toLocaleTimeString()} - {new Date(slot.end_time).toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleScheduleSlot(slot)}
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={!canBookSlot(slot.mentor_type as any, new Date(slot.start_time))}
                >
                  Schedule
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (rulesLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading scheduling rules...</p>
      </div>
    );
  }

  const groupedSlots = groupSlotsByMentorType(availableSlots);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Available Slots by Mentor Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule New Call</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderBookingWindowStatus()}
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {renderMentorTypeSlots('coach', groupedSlots.coach)}
              {renderMentorTypeSlots('founder_mentor', groupedSlots.founder_mentor)}
              {renderMentorTypeSlots('expert', groupedSlots.expert)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <Clock className="h-5 w-5" />
            <span>Upcoming Calls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingCalls.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming calls scheduled
              </p>
            ) : (
              upcomingCalls.map((call) => (
                <div key={call.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{call.participant}</div>
                    <Badge variant={call.status === 'scheduled' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-4">
                    <span className="flex items-center">
                      <CalendarIcon className="mr-1 h-4 w-4 text-orange-500" />
                      {call.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4 text-orange-500" />
                      {call.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartupCallScheduler;
