
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  mentors: {
    id: string;
    mentor_type: string;
    profiles: {
      first_name: string;
      last_name: string;
      username: string;
    };
  };
}

interface MentorSlotBookingProps {
  onSlotBooked?: () => void;
}

const MentorSlotBooking: React.FC<MentorSlotBookingProps> = ({ onSlotBooked }) => {
  const { profile } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [startupId, setStartupId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchStartupId();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (startupId) {
      fetchAvailableSlots();
    }
  }, [startupId]);

  const fetchStartupId = async () => {
    try {
      const { data: startup, error } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

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

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      const { data: slots, error } = await supabase
        .from('time_slots')
        .select(`
          id,
          start_time,
          end_time,
          is_available,
          mentors!inner(
            id,
            mentor_type,
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('is_available', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching slots:', error);
        toast({
          title: "Error",
          description: "Failed to load available slots. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setAvailableSlots(slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId: string, mentorId: string) => {
    if (!startupId) {
      toast({
        title: "Error",
        description: "Startup profile not found. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setBookingSlot(slotId);

    try {
      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          time_slot_id: slotId,
          startup_id: startupId,
          mentor_id: mentorId,
          title: 'Mentoring Session',
          status: 'scheduled',
          scheduled_at: availableSlots.find(slot => slot.id === slotId)?.start_time
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        toast({
          title: "Booking Failed",
          description: "Failed to book the slot. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Slot Booked Successfully",
        description: "Your mentoring session has been scheduled.",
      });

      // Refresh available slots
      await fetchAvailableSlots();
      
      // Notify parent component
      if (onSlotBooked) {
        onSlotBooked();
      }

    } catch (error) {
      console.error('Error booking slot:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBookingSlot(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading available slots...</p>
        </CardContent>
      </Card>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Mentor Slots</CardTitle>
          <CardDescription>Book sessions with mentors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No available slots at the moment</p>
            <p className="text-sm">Check back later for new opportunities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Mentor Slots</CardTitle>
        <CardDescription>Book sessions with mentors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {availableSlots.map((slot) => {
            const { date, time } = formatDateTime(slot.start_time);
            const mentor = slot.mentors;
            const mentorName = mentor.profiles.first_name && mentor.profiles.last_name
              ? `${mentor.profiles.first_name} ${mentor.profiles.last_name}`
              : mentor.profiles.username;

            return (
              <div key={slot.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{mentorName}</span>
                      <Badge variant="outline" className="text-xs">
                        {mentor.mentor_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{time}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBookSlot(slot.id, mentor.id)}
                    disabled={bookingSlot === slot.id}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {bookingSlot === slot.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Booking...</span>
                      </div>
                    ) : (
                      'Book Slot'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={fetchAvailableSlots}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            Refresh Slots
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorSlotBooking;
