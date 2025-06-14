import React, { useState } from 'react';
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

const StartupDashboard = () => {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const mockMentors = [
    {
      id: '1',
      name: 'John Smith',
      title: 'Partner at TechVentures',
      expertise: ['Product Strategy', 'Go-to-Market'],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      title: 'CEO of InnovateLab',
      expertise: ['Fundraising', 'Team Building'],
    },
    {
      id: '3',
      name: 'Mike Davis',
      title: 'CTO of NextGen Solutions',
      expertise: ['Technology', 'Scaling'],
    },
  ];

  const recentActivity = [
    {
      id: '1',
      description: 'Scheduled a call with John Smith',
      time: '2 hours ago',
    },
    {
      id: '2',
      description: 'Added Sarah Johnson to waitlist',
      time: '5 hours ago',
    },
    {
      id: '3',
      description: 'Completed call with Mike Davis',
      time: '1 day ago',
    },
  ];

  const upcomingCalls = [
    {
      id: '1',
      mentor: 'John Smith',
      time: 'January 15, 2024, 2:00 PM',
    },
    {
      id: '2',
      mentor: 'Sarah Johnson',
      time: 'January 18, 2024, 10:00 AM',
    },
  ];

  const handleMentorClick = (mentorId: string) => {
    setSelectedMentor(mentorId);
  };

  const handleAddToWaitlist = (mentorId: string) => {
    console.log(`Adding mentor ${mentorId} to waitlist`);
    setShowWaitlist(true);
  };

  const handleScheduleCall = (date: Date, time: string, mentor: string) => {
    console.log(`Scheduling call with ${mentor} on ${date.toDateString()} at ${time}`);
    // Here you would typically make an API call to schedule the call
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
        onClose={() => setShowWaitlist(false)}
      />
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
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mentors Contacted</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">+1 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waitlist Length</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">-1 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resources Accessed</CardTitle>
                <BookOpen className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">+5 from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Upcoming Calls */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-none space-y-3">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="border-b pb-2 last:border-none">
                      <div className="text-sm font-medium">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Calls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-none space-y-3">
                  {upcomingCalls.map((call) => (
                    <li key={call.id} className="border-b pb-2 last:border-none">
                      <div className="text-sm font-medium">Call with {call.mentor}</div>
                      <div className="text-xs text-muted-foreground">{call.time}</div>
                    </li>
                  ))}
                </ul>
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
            {mockMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{mentor.name}</CardTitle>
                  <CardDescription>{mentor.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    {mentor.expertise.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={() => handleMentorClick(mentor.id)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="follow-up">
          <PostCallFollowUp userRole="startup" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupDashboard;
