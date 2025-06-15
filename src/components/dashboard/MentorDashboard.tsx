
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UpcomingSession {
  id: string;
  title: string;
  scheduled_at: string;
  startup_name: string;
  status: string;
}

const MentorDashboard = () => {
  const { profile } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeStartups: 0,
    thisWeekSessions: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchMentorData();
    }
  }, [profile?.id]);

  const fetchMentorData = async () => {
    try {
      // Get mentor ID
      const { data: mentor } = await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!mentor) return;

      // Fetch upcoming sessions
      const { data: sessions } = await supabase
        .from('appointments')
        .select(`
          id,
          title,
          scheduled_at,
          status,
          startups!inner(
            startup_name
          )
        `)
        .eq('mentor_id', mentor.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (sessions) {
        const formattedSessions = sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          scheduled_at: session.scheduled_at,
          startup_name: session.startups.startup_name,
          status: session.status
        }));
        setUpcomingSessions(formattedSessions);
      }

      // Calculate stats
      const { count: totalSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', mentor.id)
        .eq('status', 'completed');

      const { data: uniqueStartups } = await supabase
        .from('appointments')
        .select('startup_id')
        .eq('mentor_id', mentor.id)
        .eq('status', 'completed');

      // This week sessions
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { count: thisWeekSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', mentor.id)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString());

      const uniqueStartupCount = new Set(uniqueStartups?.map(s => s.startup_id)).size;

      setStats({
        totalSessions: totalSessions || 0,
        activeStartups: uniqueStartupCount,
        thisWeekSessions: thisWeekSessions || 0
      });

    } catch (error) {
      console.error('Error fetching mentor data:', error);
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
          Your mentoring dashboard
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
            <CardTitle className="text-sm font-medium">Active Startups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStartups}</div>
            <p className="text-xs text-muted-foreground">
              Startups you've mentored
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
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-6">
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
                  <p className="text-sm">Your sessions will appear here when startups book time with you</p>
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
                              with {session.startup_name}
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

        <TabsContent value="chat" className="mt-6">
          <ChatInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorDashboard;
