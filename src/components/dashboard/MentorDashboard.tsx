import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Clock, BookOpen, Phone, Building } from 'lucide-react';
import StartupProfile from '@/components/startup/StartupProfile';
import CallScheduler from '@/components/scheduling/CallScheduler';
import SimpleChatFollowUp from './SimpleChatFollowUp';
import SharedMentorNotes from './SharedMentorNotes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Startup {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  industry?: string;
  stage?: string;
}

interface Session {
  startup: string;
  date: string;
  time: string;
  type: 'call' | 'note';
}

const MentorDashboard = () => {
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignedStartups, setAssignedStartups] = useState<Startup[]>([]);
  const [allStartups, setAllStartups] = useState<Startup[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentActivity, setRecentActivity] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    startupsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCohort, setShowCohort] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchMentorData();
    }
  }, [profile]);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      console.log('Fetching mentor data for profile:', profile?.id);

      // Get mentor info
      const { data: mentor, error: mentorError } = await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile?.id)
        .maybeSingle();

      console.log('Mentor query result:', mentor);
      console.log('Mentor error:', mentorError);

      if (mentorError) {
        console.error('Error fetching mentor:', mentorError);
        setLoading(false);
        return;
      }

      if (!mentor) {
        console.log('No mentor found for this profile');
        setLoading(false);
        return;
      }

      console.log('Found mentor with ID:', mentor.id);

      // Fetch assigned startups through assignments table
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          startups!inner(
            id,
            startup_name,
            description,
            industry,
            stage
          )
        `)
        .eq('mentor_id', mentor.id)
        .eq('is_active', true);

      console.log('Assignments query result:', assignmentsData);
      console.log('Assignments error:', assignmentsError);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
      } else if (assignmentsData) {
        const formattedStartups: Startup[] = assignmentsData.map((assignment: any) => {
          console.log('Processing assignment:', assignment);
          return {
            id: assignment.startups.id,
            name: assignment.startups.startup_name,
            description: assignment.startups.description || 'No description available',
            industry: assignment.startups.industry,
            stage: assignment.startups.stage,
            logoUrl: '/placeholder.svg'
          };
        });
        console.log('Formatted assigned startups:', formattedStartups);
        setAssignedStartups(formattedStartups);
      }

      // Fetch all startups for cohort view
      const { data: allStartupsData } = await supabase
        .from('startups')
        .select('id, startup_name, description, industry, stage');

      if (allStartupsData) {
        const formattedStartups: Startup[] = allStartupsData.map((startup: any) => ({
          id: startup.id,
          name: startup.startup_name,
          description: startup.description || 'No description available',
          industry: startup.industry,
          stage: startup.stage,
          logoUrl: '/placeholder.svg'
        }));
        setAllStartups(formattedStartups);
      }

      // Fetch upcoming sessions with real-time data
      const { data: upcomingData } = await supabase
        .from('appointments')
        .select(`
          scheduled_at,
          title,
          status,
          startups!inner(startup_name)
        `)
        .eq('mentor_id', mentor.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (upcomingData) {
        const sessions: Session[] = upcomingData.map((session: any) => ({
          startup: session.startups?.startup_name || 'Unknown Startup',
          date: new Date(session.scheduled_at).toLocaleDateString(),
          time: new Date(session.scheduled_at).toLocaleTimeString(),
          type: 'call' as const
        }));
        setUpcomingSessions(sessions);
      }

      // Fetch recent activity
      const { data: recentData } = await supabase
        .from('appointments')
        .select(`
          scheduled_at,
          status,
          startups!inner(startup_name)
        `)
        .eq('mentor_id', mentor.id)
        .in('status', ['completed', 'cancelled'])
        .order('scheduled_at', { ascending: false })
        .limit(5);

      if (recentData) {
        const activities: Session[] = recentData.map((activity: any) => ({
          startup: activity.startups?.startup_name || 'Unknown Startup',
          date: new Date(activity.scheduled_at).toLocaleDateString(),
          time: new Date(activity.scheduled_at).toLocaleTimeString(),
          type: 'call' as const
        }));
        setRecentActivity(activities);
      }

      // Calculate stats
      const { count: totalSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', mentor.id)
        .eq('status', 'completed');

      setStats({
        totalSessions: totalSessions || 0,
        startupsCount: assignmentsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedStartup) {
    return (
      <StartupProfile 
        startupId={selectedStartup} 
        onClose={() => setSelectedStartup(null)}
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
          <h1 className="text-3xl font-bold text-orange-600">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Guide startups to success</p>
        </div>
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          Active Mentor
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="startups">Startups</TabsTrigger>
          <TabsTrigger value="notes">Shared Notes</TabsTrigger>
          <TabsTrigger value="follow-up">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mentoring Sessions</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">Completed sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Startups</CardTitle>
                <BookOpen className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.startupsCount}</div>
                <p className="text-xs text-muted-foreground">Active startups</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Upcoming Sessions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <li key={index} className="border-b pb-2 last:border-none">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{activity.startup}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.date} {activity.time}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === 'call' ? 'Mentoring call' : 'Note shared'}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming sessions
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <li key={index} className="border-b pb-2 last:border-none">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{session.startup}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.date} {session.time}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Mentoring session</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <CallScheduler userRole="mentor" />
        </TabsContent>

        <TabsContent value="startups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Startups</h3>
            <Button 
              variant="outline" 
              onClick={() => setShowCohort(!showCohort)}
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              {showCohort ? 'View My Assigned Startups' : 'View All Cohort Startups'}
            </Button>
          </div>

          {/* Section Headers */}
          <div className="mb-4">
            <h4 className="text-md font-medium text-orange-600">
              {showCohort ? 'All Cohort Startups' : 'My Assigned Startups'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {showCohort 
                ? 'All startups in the current cohort' 
                : 'Startups assigned to you for mentoring'
              }
            </p>
          </div>

          {(showCohort ? allStartups : assignedStartups).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {showCohort ? 'No startups in cohort' : 'No assigned startups yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {(showCohort ? allStartups : assignedStartups).map((startup) => (
                <Card key={startup.id} className="hover:bg-accent cursor-pointer" onClick={() => setSelectedStartup(startup.id)}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{startup.name.charAt(0)}</AvatarFallback>
                        <AvatarImage src={startup.logoUrl} />
                      </Avatar>
                      <span>{startup.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{startup.description}</p>
                    {startup.industry && (
                      <Badge variant="secondary" className="mr-1 mb-1">{startup.industry}</Badge>
                    )}
                    {startup.stage && (
                      <Badge variant="outline">{startup.stage}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <SharedMentorNotes />
        </TabsContent>

        <TabsContent value="follow-up">
          <SimpleChatFollowUp userRole="mentor" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorDashboard;
