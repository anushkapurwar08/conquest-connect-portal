
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CallSchedulerProps {
  userRole: 'startup' | 'mentor';
  onScheduleCall?: (date: Date, time: string, participant: string) => void;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  mentor_id: string;
  mentor_name: string;
  is_available: boolean;
}

interface UpcomingCall {
  id: string;
  date: string;
  time: string;
  participant: string;
  status: string;
}

const CallScheduler: React.FC<CallSchedulerProps> = ({ userRole, onScheduleCall }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<UpcomingCall[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile && selectedDate) {
      fetchAvailableSlots();
    }
    fetchUpcomingCalls();
  }, [profile, selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;
    
    try {
      setLoading(true);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: slotsData } = await supabase
        .from('time_slots')
        .select(`
          id,
          start_time,
          end_time,
          mentor_id,
          is_available,
          status,
          mentors!inner(
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('is_available', true)
        .eq('status', 'available')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (slotsData) {
        const formattedSlots: TimeSlot[] = slotsData.map((slot: any) => ({
          id: slot.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          mentor_id: slot.mentor_id,
          is_available: slot.is_available,
          mentor_name: slot.mentors?.profiles?.first_name && slot.mentors?.profiles?.last_name
            ? `${slot.mentors.profiles.first_name} ${slot.mentors.profiles.last_name}`
            : slot.mentors?.profiles?.username || 'Unknown Mentor'
        }));
        setAvailableSlots(formattedSlots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingCalls = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          status,
          title,
          startups!inner(startup_name),
          mentors!inner(
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (userRole === 'startup') {
        const { data: startup } = await supabase
          .from('startups')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();
        
        if (startup) {
          query = query.eq('startup_id', startup.id);
        }
      } else if (userRole === 'mentor') {
        const { data: mentor } = await supabase
          .from('mentors')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();
        
        if (mentor) {
          query = query.eq('mentor_id', mentor.id);
        }
      }

      const { data: callsData } = await query;

      if (callsData) {
        const formattedCalls: UpcomingCall[] = callsData.map((call: any) => {
          const participant = userRole === 'startup' 
            ? (call.mentors?.profiles?.first_name && call.mentors?.profiles?.last_name
                ? `${call.mentors.profiles.first_name} ${call.mentors.profiles.last_name}`
                : call.mentors?.profiles?.username || 'Unknown Mentor')
            : call.startups?.startup_name || 'Unknown Startup';

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
      if (userRole === 'startup') {
        // For startups, schedule directly
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
      } else {
        // For mentors, use the callback
        const date = new Date(slot.start_time);
        const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        onScheduleCall?.(date, time, slot.mentor_name);
      }

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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar and Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule New Call</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>
          
          {selectedDate && (
            <div>
              <h4 className="font-medium mb-2">
                Available Slots for {format(selectedDate, 'MMM dd, yyyy')}
              </h4>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No available slots for this date
                </p>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{slot.mentor_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(slot.start_time).toLocaleTimeString()} - {new Date(slot.end_time).toLocaleTimeString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleScheduleSlot(slot)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Schedule
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

export default CallScheduler;
