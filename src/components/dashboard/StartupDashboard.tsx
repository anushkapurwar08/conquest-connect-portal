
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, MessageSquare, Clock, Phone, Bell, ExternalLink } from 'lucide-react';
import SimpleChatFollowUp from './SimpleChatFollowUp';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Mentor {
  id: string;
  name: string;
  title: string;
  mentorType: 'Expert' | 'Founder Mentor' | 'Coach';
  company: string;
  linkedinUrl?: string;
}

interface TimeSlot {
  id: string;
  mentor_id: string;
  mentor_name: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Appointment {
  id: string;
  mentor_name: string;
  scheduled_at: string;
  title: string;
  status: string;
}

const StartupDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    mentorsContacted: 0,
    pendingReschedules: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch startup info
      const { data: startup } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!startup) {
        setLoading(false);
        return;
      }

      // Fetch mentors with simplified information
      const { data: mentorsData } = await supabase
        .from('mentors')
        .select(`
          id,
          profiles!inner(
            username,
            first_name,
            last_name,
            title,
            company
          )
        `);

      if (mentorsData) {
        const formattedMentors: Mentor[] = mentorsData.map((mentor: any) => ({
          id: mentor.id,
          name: mentor.profiles.first_name && mentor.profiles.last_name 
            ? `${mentor.profiles.first_name} ${mentor.profiles.last_name}`
            : mentor.profiles.username,
          title: mentor.profiles.title || 'Mentor',
          mentorType: getMentorType(mentor.profiles.title),
          company: mentor.profiles.company || '',
          linkedinUrl: `https://linkedin.com/in/${mentor.profiles.username}`
        }));
        setMentors(formattedMentors);
      }

      // Fetch available time slots
      const { data: slotsData } = await supabase
        .from('time_slots')
        .select(`
          id,
          mentor_id,
          start_time,
          end_time,
          is_available,
          mentors!inner(
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('is_available', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (slotsData) {
        const formattedSlots: TimeSlot[] = slotsData.map((slot: any) => ({
          id: slot.id,
          mentor_id: slot.mentor_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
          mentor_name: slot.mentors?.profiles?.first_name && slot.mentors?.profiles?.last_name
            ? `${slot.mentors.profiles.first_name} ${slot.mentors.profiles.last_name}`
            : slot.mentors?.profiles?.username || 'Unknown Mentor'
        }));
        setAvailableSlots(formattedSlots);
      }

      // Fetch upcoming appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          title,
          scheduled_at,
          status,
          mentors!inner(
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('startup_id', startup.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (appointmentsData) {
        const formattedAppointments: Appointment[] = appointmentsData.map((apt: any) => ({
          id: apt.id,
          title: apt.title || 'Mentoring Session',
          scheduled_at: apt.scheduled_at,
          status: apt.status,
          mentor_name: apt.mentors?.profiles?.first_name && apt.mentors?.profiles?.last_name
            ? `${apt.mentors.profiles.first_name} ${apt.mentors.profiles.last_name}`
            : apt.mentors?.profiles?.username || 'Unknown Mentor'
        }));
        setUpcomingCalls(formattedAppointments);
      }

      // Calculate stats
      const { count: totalCalls } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('startup_id', startup.id);

      const { count: pendingReschedules } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('startup_id', startup.id)
        .eq('status', 'reschedule_requested');

      const { data: uniqueMentors } = await supabase
        .from('appointments')
        .select('mentor_id')
        .eq('startup_id', startup.id);

      const uniqueMentorIds = new Set(uniqueMentors?.map(apt => apt.mentor_id) || []);

      setStats({
        totalCalls: totalCalls || 0,
        mentorsContacted: uniqueMentorIds.size,
        pendingReschedules: pendingReschedules || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMentorType = (title: string): 'Expert' | 'Founder Mentor' | 'Coach' => {
    if (title?.toLowerCase().includes('founder')) return 'Founder Mentor';
    if (title?.toLowerCase().includes('coach')) return 'Coach';
    return 'Expert';
  };

  const handleScheduleCall = async (slot: TimeSlot) => {
    try {
      const { data: startup } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!startup) return;

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

      // Mark slot as unavailable
      await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('id', slot.id);

      toast({
        title: "Call Scheduled",
        description: `Your call with ${slot.mentor_name} has been scheduled successfully.`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({
        title: "Error",
        description: "Failed to schedule the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRequestReschedule = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'reschedule_requested' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Reschedule Requested",
        description: "Your reschedule request has been sent to the mentor for approval.",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      toast({
        title: "Error",
        description: "Failed to request reschedule. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Startup Dashboard</h1>
          <p className="text-muted-foreground">Manage your mentorship journey</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Calls</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Phone className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCalls}</div>
                <p className="text-xs text-muted-foreground">Completed sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mentors Contacted</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.mentorsContacted}</div>
                <p className="text-xs text-muted-foreground">Unique mentors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reschedules</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReschedules}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Calls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Calls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingCalls.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming calls scheduled
                </p>
              ) : (
                <ul className="list-none space-y-3">
                  {upcomingCalls.slice(0, 5).map((call) => (
                    <li key={call.id} className="border-b pb-3 last:border-none">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{call.title}</div>
                          <div className="text-xs text-muted-foreground">
                            with {call.mentor_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(call.scheduled_at).toLocaleDateString()} at{' '}
                            {new Date(call.scheduled_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={call.status === 'scheduled' ? 'default' : 'secondary'}>
                            {call.status}
                          </Badge>
                          {call.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestReschedule(call.id)}
                            >
                              Request Reschedule
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <Calendar className="h-5 w-5" />
                <span>Available Time Slots</span>
              </CardTitle>
              <CardDescription>
                Select from available mentor time slots to schedule your call
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableSlots.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No available slots at the moment
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {availableSlots.slice(0, 8).map((slot) => (
                    <Card key={slot.id} className="p-4">
                      <div className="space-y-2">
                        <div className="font-medium">{slot.mentor_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(slot.start_time).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(slot.start_time).toLocaleTimeString()} - {new Date(slot.end_time).toLocaleTimeString()}
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleScheduleCall(slot)}
                        >
                          Schedule Call
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{mentor.name}</CardTitle>
                  <CardDescription>{mentor.title} {mentor.company && `at ${mentor.company}`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {mentor.mentorType}
                    </Badge>
                    {mentor.linkedinUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(mentor.linkedinUrl, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        LinkedIn Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <SimpleChatFollowUp userRole="startup" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupDashboard;
