import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Clock, BookOpen, Phone, Star, Building } from 'lucide-react';
import StartupProfile from '@/components/startup/StartupProfile';
import CallScheduler from '@/components/scheduling/CallScheduler';
import PostCallFollowUp from './PostCallFollowUp';
import SharedMentorNotes from './SharedMentorNotes';

const MentorDashboard = () => {
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mentorData = {
    name: 'John Smith',
    title: 'Senior Mentor',
    avatarUrl: '/placeholder.svg',
    totalSessions: 24,
    availableHours: 10,
    rating: 4.8,
    recentActivity: [
      {
        type: 'call',
        startup: 'TechStart Inc.',
        date: '2024-01-05',
        time: '14:00'
      },
      {
        type: 'note',
        startup: 'InnovateLab',
        date: '2024-01-03',
        time: '16:00'
      }
    ],
    upcomingSessions: [
      {
        startup: 'NextGen Solutions',
        date: '2024-01-10',
        time: '11:00'
      },
      {
        startup: 'FutureForward',
        date: '2024-01-12',
        time: '15:00'
      }
    ],
    startups: [
      {
        id: 'techstart',
        name: 'TechStart Inc.',
        description: 'Developing AI solutions for healthcare',
        logoUrl: '/placeholder.svg'
      },
      {
        id: 'innovatelab',
        name: 'InnovateLab',
        description: 'Creating sustainable energy solutions',
        logoUrl: '/placeholder.svg'
      },
      {
        id: 'nextgen',
        name: 'NextGen Solutions',
        description: 'Building the future of education',
        logoUrl: '/placeholder.svg'
      }
    ]
  };

  const handleScheduleCall = (date: Date, time: string, startup: string) => {
    console.log(`Scheduling call with ${startup} on ${date.toDateString()} at ${time}`);
    // Here you would typically make an API call to schedule the call
  };

  if (selectedStartup) {
    return (
      <StartupProfile 
        startupId={selectedStartup} 
        onClose={() => setSelectedStartup(null)}
      />
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
          <TabsTrigger value="follow-up">Post-Call</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mentoring Sessions</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+4 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Hours</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10</div>
                <p className="text-xs text-muted-foreground">Hours per week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Startups Mentored</CardTitle>
                <BookOpen className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Active startups</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">Out of 5</p>
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
                <ul className="space-y-4">
                  {mentorData.recentActivity.map((activity, index) => (
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
                <ul className="space-y-4">
                  {mentorData.upcomingSessions.map((session, index) => (
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <CallScheduler 
            userRole="mentor" 
            onScheduleCall={handleScheduleCall}
          />
        </TabsContent>

        <TabsContent value="startups" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {mentorData.startups.map((startup) => (
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
                  <p className="text-sm text-muted-foreground">{startup.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <SharedMentorNotes />
        </TabsContent>

        <TabsContent value="follow-up">
          <PostCallFollowUp userRole="mentor" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorDashboard;
