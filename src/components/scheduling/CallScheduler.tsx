import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User, Calendar as CalendarIcon, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useSchedulingRules } from '@/hooks/useSchedulingRules';
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

const CallScheduler: React.FC<CallSchedulerProps> = ({ userRole, onScheduleCall }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<UpcomingCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSlotCreation, setShowSlotCreation] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [mentorType, setMentorType] = useState<'founder_mentor' | 'expert' | 'coach'>('expert');
  const [coachAssignments, setCoachAssignments] = useState<string[]>([]);
  const { profile, user } = useAuth();
  const { 
    isWithinBookingWindow, 
    canCreateSlot, 
    canBookSlot, 
    isMentorTypeVisible,
    getAdvanceBookingWeeks,
    loading: rulesLoading 
  } = useSchedulingRules();

  useEffect(() => {
    if (profile && selectedDate) {
      fetchMentorType();
      fetchAvailableSlots();
    }
    fetchUpcomingCalls();
  }, [profile, selectedDate]);

  const fetchMentorType = async () => {
    if (userRole !== 'mentor') return;
    
    try {
      const { data: mentor } = await supabase
        .from('mentors')
        .select('mentor_type')
        .eq('profile_id', profile?.id)
        .single();

      if (mentor) {
        setMentorType(mentor.mentor_type);
        
        // If coach, fetch assignments
        if (mentor.mentor_type === 'coach') {
          fetchCoachAssignments();
        }
      }
    } catch (error) {
      console.error('Error fetching mentor type:', error);
    }
  };

  const fetchCoachAssignments = async () => {
    try {
      const { data: mentor } = await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (mentor) {
        const { data: assignments } = await supabase
          .from('coach_startup_assignments')
          .select('startup_id')
          .eq('coach_id', mentor.id)
          .eq('is_active', true);

        setCoachAssignments(assignments?.map(a => a.startup_id) || []);
      }
    } catch (error) {
      console.error('Error fetching coach assignments:', error);
    }
  };

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
            mentor_type,
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
        const formattedSlots: TimeSlot[] = slotsData
          .filter((slot: any) => {
            // Filter based on mentor type visibility
            const slotMentorType = slot.mentors?.mentor_type;
            if (userRole === 'startup' && !isMentorTypeVisible(slotMentorType)) {
              return false;
            }
            
            // For coaches, only show slots if startup is assigned
            if (userRole === 'startup' && slotMentorType === 'coach') {
              // This would need startup assignment check - simplified for now
              return true;
            }
            
            return true;
          })
          .map((slot: any) => ({
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

    if (!canCreateSlot(mentorType, selectedDate)) {
      const weeks = getAdvanceBookingWeeks(mentorType);
      toast({
        title: "Error",
        description: `You can only create slots up to ${weeks} week${weeks > 1 ? 's' : ''} in advance for ${mentorType.replace('_', ' ')}s.`,
        variant: "destructive"
      });
      return;
    }

    if (!user || !profile?.id) {
      toast({
        title: "Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating time slot for user:', user.id, 'profile:', profile.id);
      
      const { data: mentor, error: mentorError } = await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      console.log('Mentor query result:', { mentor, mentorError });

      let mentorId = mentor?.id;

      if (!mentor) {
        console.log('No mentor profile found, creating one...');
        
        const { data: newMentor, error: createMentorError } = await supabase
          .from('mentors')
          .insert({
            profile_id: profile.id,
            mentor_type: mentorType
          })
          .select('id')
          .single();

        console.log('Mentor creation result:', { newMentor, createMentorError });

        if (createMentorError) {
          console.error('Error creating mentor profile:', createMentorError);
          toast({
            title: "Profile Error",
            description: `Could not create mentor profile: ${createMentorError.message}`,
            variant: "destructive"
          });
          return;
        }

        mentorId = newMentor?.id;
      }

      if (!mentorId) {
        toast({
          title: "Error",
          description: "Could not find or create mentor profile.",
          variant: "destructive"
        });
        return;
      }

      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const slotData = {
        mentor_id: mentorId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_available: true,
        status: 'available'
      };

      console.log('Creating slot with data:', slotData);

      const { data, error } = await supabase
        .from('time_slots')
        .insert(slotData)
        .select();

      if (error) {
        console.error('Time slot creation error:', error);
        toast({
          title: "Slot Creation Error",
          description: `Failed to create time slot: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Time slot created successfully:', data);

      toast({
        title: "Success",
        description: "Your available time slot has been created successfully.",
      });

      setSelectedTime('');
      setShowSlotCreation(false);
      fetchAvailableSlots();
    } catch (error) {
      console.error('Unexpected error creating time slot:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleSlot = async (slot: TimeSlot) => {
    try {
      if (userRole === 'startup') {
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

  const renderBookingWindowStatus = () => {
    if (userRole !== 'startup') return null;

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

  if (rulesLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading scheduling rules...</p>
      </div>
    );
  }

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
          {renderBookingWindowStatus()}
          
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
                  disabled={!canCreateSlot(mentorType, selectedDate)}
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
              {!canCreateSlot(mentorType, selectedDate) && (
                <p className="text-xs text-red-600">
                  You can only create slots up to {getAdvanceBookingWeeks(mentorType)} week(s) in advance.
                </p>
              )}
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
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">{slot.mentor_name}</div>
                            <Badge variant="outline" className="text-xs">
                              {slot.mentor_type.replace('_', ' ')}
                            </Badge>
                          </div>
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
                            disabled={!canBookSlot(slot.mentor_type as any, new Date(slot.start_time))}
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
