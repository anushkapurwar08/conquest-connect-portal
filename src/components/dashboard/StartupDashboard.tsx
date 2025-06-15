
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, MapPin, TrendingUp } from 'lucide-react';
import StartupMentorChat from './StartupMentorChat';
import ViewPods from './ViewPods';
import CallScheduler from '@/components/scheduling/CallScheduler';
import { useAuth } from '@/hooks/useAuth';

const StartupDashboard = () => {
  const { profile } = useAuth();

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
      <Tabs defaultValue="mentors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mentors" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Mentors</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="pods" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>View Pods</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Progress</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="mt-6">
          <StartupMentorChat />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <CallScheduler userRole="startup" />
        </TabsContent>

        <TabsContent value="pods" className="mt-6">
          <ViewPods />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mentoring Progress</CardTitle>
                <CardDescription>Track your mentoring journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sessions Completed</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Mentors</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Goals Achieved</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start chatting with mentors to see activity here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupDashboard;
