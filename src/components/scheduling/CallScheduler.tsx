
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User, Calendar as CalendarIcon, Plus } from 'lucide-react';
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
  status: string;
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
  const [showSlotCreation, setShowSlotCreation] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
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

      let query = supabase
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
        .eq('status', 'available')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      // For mentors, show only their own slots
      if (userRole === 'mentor') {
        const { data: mentor } = await supabase
          .from('mentors')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();
        
        if (mentor) {
          query = query.eq('mentor_id', mentor.id);
        }
      }

      const { data: slotsData, error } = await query;

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

      const { data: callsData, error } = await query;

      if (error) {
        console.error('Error fetching upcoming calls:', error);
        return;
      }

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

  const handleCreateTimeSlot = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select a date and time for the slot.",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating time slot for profile:', profile?.id);
      
      // First, check if user is authenticated and has a mentor profile
      const { data: mentor, error: mentorError } = await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (mentorError) {
        console.error('Mentor fetch error:', mentorError);
        toast({
          title: "Error",
          description: "Could not verify mentor profile. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!mentor) {
        // Create a mentor profile if it doesn't exist
        console.log('Creating mentor profile for user:', profile.id);
        const { data: newMentor, error: createMentorError } = await supabase
          .from('mentors')
          .insert({
            profile_id: profile.id
          })
          .select('id')
          .single();

        if (createMentorError) {
          console.error('Error creating mentor profile:', createMentorError);
          toast({
            title: "Error",
            description: "Could not create mentor profile. Please contact support.",
            variant: "destructive"
          });
          return;
        }

        if (!newMentor) {
          toast({
            title: "Error",
            description: "Failed to create mentor profile.",
            variant: "destructive"
          });
          return;
        }

        console.log('Created new mentor profile:', newMentor.id);
      }

      // Get the mentor ID (either existing or newly created)
      const mentorId = mentor?.id || (await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile.id)
        .single()).data?.id;

      if (!mentorId) {
        toast({
          title: "Error",
          description: "Could not find or create mentor profile.",
          variant: "destructive"
        });
        return;
      }

      console.log('Using mentor ID:', mentorId);

      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1); // 1-hour slots

      console.log('Creating slot with:', {
        mentor_id: mentorId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_available: true,
        status: 'available'
      });

      const { data, error } = await supabase
        .from('time_slots')
        .insert({
          mentor_id: mentorId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_available: true,
          status: 'available'
        })
        .select();

      if (error) {
        console.error('Time slot creation error:', error);
        toast({
          title: "Error",
          description: `Failed to create time slot: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Time slot created successfully:', data);

      toast({
        title: "Time Slot Created",
        description: "Your available time slot has been created successfully.",
      });

      setSelectedTime('');
      setShowSlotCreation(false);
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error creating time slot:', error);
      toast({
        title: "Error",
        description: "Failed to create time slot. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleSlot = async (slot: TimeSlot) => {
    try {
      if (userRole === 'startup') {
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
      }
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({
        title: "Error",
        description: "Failed to schedule the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Time Slot Deleted",
        description: "The time slot has been removed successfully.",
      });

      fetchAvailableSlots();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete time slot. Please try again.",
        variant: "destructive"
      });
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar and Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-orange-600">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{userRole === 'mentor' ? 'Manage Available Slots' : 'Schedule New Call'}</span>
            </div>
            {userRole === 'mentor' && (
              <Button
                size="sm"
                onClick={() => setShowSlotCreation(!showSlotCreation)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Slot
              </Button>
            )}
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

          {userRole === 'mentor' && showSlotCreation && selectedDate && (
            <div className="space-y-4 p-4 border rounded-lg bg-orange-50">
              <h4 className="font-medium">Create Available Slot for {format(selectedDate, 'MMM dd, yyyy')}</h4>
              <div>
                <label className="text-sm font-medium">Select Time:</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select time...</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleCreateTimeSlot}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Create Slot
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSlotCreation(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {selectedDate && (
            <div>
              <h4 className="font-medium mb-2">
                {userRole === 'mentor' ? 'Your Available Slots' : 'Available Slots'} for {format(selectedDate, 'MMM dd, yyyy')}
              </h4>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {userRole === 'mentor' ? 'No slots created for this date' : 'No available slots for this date'}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        {userRole === 'startup' && (
                          <div className="text-sm font-medium">{slot.mentor_name}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {new Date(slot.start_time).toLocaleTimeString()} - {new Date(slot.end_time).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {userRole === 'startup' ? (
                          <Button
                            size="sm"
                            onClick={() => handleScheduleSlot(slot)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            Schedule
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
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
