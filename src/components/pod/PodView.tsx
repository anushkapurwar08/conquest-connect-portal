
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Video, Clock } from 'lucide-react';

const PodView = () => {
  // Mock data for demonstration
  const podMembers = [
    { id: '1', name: 'TechFlow Solutions', stage: 'Series A', industry: 'SaaS' },
    { id: '2', name: 'GreenStart Energy', stage: 'Seed', industry: 'CleanTech' },
    { id: '3', name: 'DataDrive Analytics', stage: 'Pre-seed', industry: 'AI/ML' }
  ];

  const upcomingPodCalls = [
    { id: '1', title: 'Weekly Pod Check-in', date: '2024-12-22', time: '10:00 AM', type: 'pod_call' },
    { id: '2', title: 'Cohort Demo Day Prep', date: '2024-12-25', time: '2:00 PM', type: 'cohort' }
  ];

  const cohortInfo = {
    name: 'Winter 2024 Cohort',
    totalStartups: 12,
    programWeek: 8,
    demoDay: '2025-01-15'
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Pod Members</span>
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>Pod Calls</span>
          </TabsTrigger>
          <TabsTrigger value="cohort" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Cohort</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pod Members</CardTitle>
              <CardDescription>Startups in your pod</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {podMembers.map((startup) => (
                  <div key={startup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg`} />
                        <AvatarFallback>
                          {startup.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{startup.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{startup.industry}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {startup.stage}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Pod Calls</CardTitle>
                <CardDescription>Weekly check-ins and special sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingPodCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Video className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{call.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{call.date} at {call.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={call.type === 'pod_call' ? 'default' : 'secondary'}>
                          {call.type === 'pod_call' ? 'Pod Call' : 'Cohort'}
                        </Badge>
                        <Button size="sm">Join Call</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Pod Schedule</CardTitle>
                <CardDescription>Recurring pod activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Weekly Check-in</span>
                      <p className="text-sm text-muted-foreground">Every Friday at 10:00 AM</p>
                    </div>
                    <Badge variant="outline">Recurring</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Office Hours</span>
                      <p className="text-sm text-muted-foreground">Every Tuesday at 3:00 PM</p>
                    </div>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Overview</CardTitle>
                <CardDescription>Your current cohort information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{cohortInfo.name}</h3>
                      <p className="text-muted-foreground">Week {cohortInfo.programWeek} of 12</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Startups:</span>
                        <span className="font-medium">{cohortInfo.totalStartups}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Demo Day:</span>
                        <span className="font-medium">{cohortInfo.demoDay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Program Progress:</span>
                        <span className="font-medium">{Math.round((cohortInfo.programWeek / 12) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(cohortInfo.programWeek / 12) * 100}%` }}
                      ></div>
                    </div>
                    <Button className="w-full">View Full Cohort</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Cohort Events</CardTitle>
                <CardDescription>Program-wide activities and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Investor Pitch Workshop</span>
                      <p className="text-sm text-muted-foreground">December 28, 2024 • 2:00 PM</p>
                    </div>
                    <Badge>Required</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Demo Day Rehearsal</span>
                      <p className="text-sm text-muted-foreground">January 10, 2025 • 10:00 AM</p>
                    </div>
                    <Badge>Required</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Final Demo Day</span>
                      <p className="text-sm text-muted-foreground">January 15, 2025 • 6:00 PM</p>
                    </div>
                    <Badge variant="secondary">Milestone</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PodView;
