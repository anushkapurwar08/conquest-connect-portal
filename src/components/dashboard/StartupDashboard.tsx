
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, Users, TrendingUp } from 'lucide-react';
import StartupMentorChat from './StartupMentorChat';
import MentorChatList from './MentorChatList';
import MentorSlotBooking from '@/components/mentor/MentorSlotBooking';
import PodView from '@/components/pod/PodView';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UpcomingSession {
  id: string;
  title: string;
  scheduled_at: string;
  mentor_name: string;
  status: string;
}

const StartupDashboard = () => {
  const { profile } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeMentors: 0,
    goalsAchieved: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchStartupData();
    }
  }, [profile?.id]);

  const fetchStartupData = async () => {
    try {
      // Get startup ID
      const { data: startup } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!startup) return;

      // Fetch upcoming sessions
      const { data: sessions } = await supabase
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
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (sessions) {
        const formattedSessions = sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          scheduled_at: session.scheduled_at,
          mentor_name: session.mentors.profiles.first_name && session.mentors.profiles.last_name
            ? `${session.mentors.profiles.first_name} ${session.mentors.profiles.last_name}`
            : session.mentors.profiles.username,
          status: session.status
        }));
        setUpcomingSessions(formattedSessions);
      }

      // Calculate stats
      const { count: totalSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('startup_id', startup.id)
        .eq('status', 'completed');

      const { data: uniqueMentors } = await supabase
        .from('appointments')
        .select('mentor_id')
        .eq('startup_id', startup.id)
        .eq('status', 'completed');

      const uniqueMentorCount = new Set(uniqueMentors?.map(m => m.mentor_id)).size;

      setStats({
        totalSessions: totalSessions || 0,
        activeMentors: uniqueMentorCount,
        goalsAchieved: 0 // This would come from a goals tracking system
      });

    } catch (error) {
      console.error('Error fetching startup data:', error);
    }
  };

  const handleSlotBooked = () => {
    // Refresh the sessions data when a slot is booked
    fetchStartupData();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name || profile?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Connect with mentors and grow your startup
        </p>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="startups" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Startups</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Community</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6 space-y-6">
          {/* Available Slots Section - Direct display */}
          <MentorSlotBooking onSlotBooked={handleSlotBooked} />
          
          {/* Mentor Chat Section - for starting new conversations */}
          <StartupMentorChat />
        </TabsContent>

        <TabsContent value="startups" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming sessions scheduled</p>
                  <p className="text-sm">Book a slot with a mentor to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => {
                    const sessionDate = new Date(session.scheduled_at);
                    
                    return (
                      <div key={session.id} className="border rounded-lg p-4 hover:bg-accent">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              with {session.mentor_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Badge>{session.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <PodView />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <MentorChatList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupDashboard;
