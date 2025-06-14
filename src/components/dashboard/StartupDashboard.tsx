
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Clock, BookOpen, Phone, Bell } from 'lucide-react';
import MentorProfile from '@/components/mentor/MentorProfile';
import WaitlistManager from '@/components/waitlist/WaitlistManager';
import CallScheduler from '@/components/scheduling/CallScheduler';
import PostCallFollowUp from './PostCallFollowUp';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Mentor {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  company: string;
}

interface Appointment {
  id: string;
  mentor_name: string;
  scheduled_at: string;
  title: string;
}

const StartupDashboard = () => {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    mentorsContacted: 0,
    waitlistLength: 0,
    resourcesAccessed: 28
  });
  const [loading, setLoading] = useState(true);
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

      // Fetch available mentors
      const { data: mentorsData } = await supabase
        .from('mentors')
        .select(`
          id,
          profiles!inner(
            username,
            first_name,
            last_name,
            title,
            company,
            expertise
          )
        `);

      if (mentorsData) {
        const formattedMentors: Mentor[] = mentorsData.map((mentor: any) => ({
          id: mentor.id,
          name: mentor.profiles.first_name && mentor.profiles.last_name 
            ? `${mentor.profiles.first_name} ${mentor.profiles.last_name}`
            : mentor.profiles.username,
          title: mentor.profiles.title || 'Mentor',
          company: mentor.profiles.company || '',
          expertise: mentor.profiles.expertise || []
        }));
        setMentors(formattedMentors);
      }

      // Fetch upcoming appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          title,
          scheduled_at,
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

      if (appointmentsData) {
        const formattedAppointments: Appointment[] = appointmentsData.map((apt: any) => ({
          id: apt.id,
          title: apt.title,
          scheduled_at: apt.scheduled_at,
          mentor_name: apt.mentors?.profiles?.first_name && apt.mentors?.profiles?.last_name
            ? `${apt.mentors.profiles.first_name} ${apt.mentors.profiles.last_name}`
            : apt.mentors?.profiles?.username || 'Unknown Mentor'
        }));
        setUpcomingCalls(formattedAppointments);
      }

      // Fetch stats
      const [
        { count: totalCalls },
        { count: waitlistLength }
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('startup_id', startup.id),
        supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('startup_id', startup.id)
      ]);

      // Get unique mentors contacted
      const { data: uniqueMentors } = await supabase
        .from('appointments')
        .select('mentor_id')
        .eq('startup_id', startup.id);

      const uniqueMentorIds = new Set(uniqueMentors?.map(apt => apt.mentor_id) || []);

      setStats({
        totalCalls: totalCalls || 0,
        mentorsContacted: uniqueMentorIds.size,
        waitlistLength: waitlistLength || 0,
        resourcesAccessed: 28
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorClick = (mentorId: string) => {
    setSelectedMentor(mentorId);
  };

  const handleAddToWaitlist = (mentorId: string) => {
    console.log(`Adding mentor ${mentorId} to waitlist`);
    setShowWaitlist(true);
  };

  const handleScheduleCall = (date: Date, time: string, mentor: string) => {
    console.log(`Scheduling call with ${mentor} on ${date.toDateString()} at ${time}`);
  };

  if (selectedMentor) {
    return (
      <MentorProfile 
        mentorId={selectedMentor} 
        onClose={() => setSelectedMentor(null)}
        onAddToWaitlist={handleAddToWaitlist}
      />
    );
  }

  if (showWaitlist) {
    return (
      <WaitlistManager 
        userRole="startup"
      />
    );
  }

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
        <Button 
          variant="outline" 
          onClick={() => setShowWaitlist(true)}
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          <Bell className="mr-2 h-4 w-4" />
          View Waitlist
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Calls</TabsTrigger>
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="follow-up">Post-Call</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
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
                <CardTitle className="text-sm font-medium">Waitlist Length</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.waitlistLength}</div>
                <p className="text-xs text-muted-foreground">Pending requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resources Accessed</CardTitle>
                <BookOpen className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resourcesAccessed}</div>
                <p className="text-xs text-muted-foreground">Learning materials</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Calls */}
          <div className="grid gap-6 md:grid-cols-2">
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
                    {upcomingCalls.slice(0, 3).map((call) => (
                      <li key={call.id} className="border-b pb-2 last:border-none">
                        <div className="text-sm font-medium">{call.title}</div>
                        <div className="text-xs text-muted-foreground">
                          with {call.mentor_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(call.scheduled_at).toLocaleDateString()} at{' '}
                          {new Date(call.scheduled_at).toLocaleTimeString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('mentors')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Browse Mentors
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('schedule')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule a Call
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowWaitlist(true)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Manage Waitlist
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <CallScheduler 
            userRole="startup" 
            onScheduleCall={handleScheduleCall}
          />
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
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-4 w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                      onClick={() => handleMentorClick(mentor.id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="follow-up">
          <PostCallFollowUp 
            userRole="startup" 
            callId="mock-call-id"
            startup="TechStart Inc."
            mentor="John Smith"
            date="2024-01-15"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupDashboard;
