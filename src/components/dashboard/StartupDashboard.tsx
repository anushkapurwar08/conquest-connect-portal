
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, Users, TrendingUp, Clock, CheckCircle, User } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import CallScheduler from '@/components/scheduling/CallScheduler';
import StartupMentorChat from './StartupMentorChat';
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
    thisWeekSessions: 0
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
        const formattedSessions = sessions.map((session: any) => {
          const mentorName = session.mentors?.profiles?.first_name && session.mentors?.profiles?.last_name
            ? `${session.mentors.profiles.first_name} ${session.mentors.profiles.last_name}`
            : session.mentors?.profiles?.username || 'Unknown Mentor';

          return {
            id: session.id,
            title: session.title,
            scheduled_at: session.scheduled_at,
            mentor_name: mentorName,
            status: session.status
          };
        });
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

      // This week sessions
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { count: thisWeekSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('startup_id', startup.id)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString());

      const uniqueMentorCount = new Set(uniqueMentors?.map(m => m.mentor_id)).size;

      setStats({
        totalSessions: totalSessions || 0,
        activeMentors: uniqueMentorCount,
        thisWeekSessions: thisWeekSessions || 0
      });

    } catch (error) {
      console.error('Error fetching startup data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name || profile?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your startup dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Completed mentoring sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMentors}</div>
            <p className="text-xs text-muted-foreground">
              Mentors you've worked with
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessions scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Mentors</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your next scheduled mentoring sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming sessions scheduled</p>
                    <p className="text-sm">Book a session with a mentor to get started</p>
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
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="mt-6">
          <CallScheduler userRole="startup" />
        </TabsContent>

        <TabsContent value="mentors" className="mt-6">
          <StartupMentorChat />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>View your past and upcoming mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Session history will appear here</p>
                <p className="text-sm">Your completed and scheduled sessions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ChatInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupDashboard;
