import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users, Phone, Clock, AlertCircle, CheckCircle, Upload, FileText, Eye, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TeamDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPod, setSelectedPod] = useState('all');
  const [uploadingNotes, setUploadingNotes] = useState(false);

  const currentCalls = [
    { id: 1, startup: 'TechFlow', mentor: 'John Smith', status: 'ongoing', duration: '25 mins' },
    { id: 2, startup: 'GreenStart', mentor: 'Sarah Johnson', status: 'ongoing', duration: '10 mins' },
  ];

  const scheduledCalls = [
    { id: 1, startup: 'DataDrive', mentor: 'Mike Chen', time: '2:00 PM', date: 'Dec 21', status: 'confirmed' },
    { id: 2, startup: 'HealthTech', mentor: 'Lisa Wong', time: '3:30 PM', date: 'Dec 21', status: 'confirmed' },
    { id: 3, startup: 'EduStart', mentor: 'David Park', time: '10:00 AM', date: 'Dec 22', status: 'pending' },
    { id: 4, startup: 'FinTech Pro', mentor: 'Emma Davis', time: '11:30 AM', date: 'Dec 22', status: 'confirmed' },
    { id: 5, startup: 'AI Solutions', mentor: 'Chris Brown', time: '2:00 PM', date: 'Dec 22', status: 'rescheduled' },
  ];

  const recentActivity = [
    { type: 'completed', startup: 'TechFlow', mentor: 'John Smith', time: '1 hour ago' },
    { type: 'cancelled', startup: 'GreenStart', mentor: 'Sarah Johnson', time: '2 hours ago' },
    { type: 'scheduled', startup: 'DataDrive', mentor: 'Mike Chen', time: '3 hours ago' },
    { type: 'feedback', startup: 'HealthTech', mentor: 'Lisa Wong', time: '4 hours ago' },
  ];

  const pods = [
    { id: 'pod-a', name: 'Pod A', startups: ['TechFlow', 'GreenStart', 'DataDrive'] },
    { id: 'pod-b', name: 'Pod B', startups: ['HealthTech', 'EduStart', 'FinTech Pro'] },
    { id: 'pod-c', name: 'Pod C', startups: ['AI Solutions', 'CleanEnergy', 'FoodTech'] },
  ];

  const callsWithNotes = [
    {
      id: 1,
      startup: 'TechFlow',
      mentor: 'John Smith',
      pod: 'Pod A',
      date: 'Dec 20, 2024',
      time: '2:00 PM',
      duration: '45 mins',
      hasNotes: true,
      notesUploaded: true,
      sharedWithMentors: false
    },
    {
      id: 2,
      startup: 'GreenStart',
      mentor: 'Sarah Johnson',
      pod: 'Pod A',
      date: 'Dec 20, 2024',
      time: '3:30 PM',
      duration: '30 mins',
      hasNotes: true,
      notesUploaded: false,
      sharedWithMentors: false
    },
    {
      id: 3,
      startup: 'HealthTech',
      mentor: 'Lisa Wong',
      pod: 'Pod B',
      date: 'Dec 19, 2024',
      time: '10:00 AM',
      duration: '50 mins',
      hasNotes: false,
      notesUploaded: false,
      sharedWithMentors: false
    }
  ];

  const filteredCalls = scheduledCalls.filter(call => 
    call.startup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.mentor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCallsByPod = callsWithNotes.filter(call => 
    selectedPod === 'all' || call.pod === selectedPod
  );

  const handleUploadNotes = (callId: number) => {
    setUploadingNotes(true);
    // Simulate upload
    setTimeout(() => {
      setUploadingNotes(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Team Operations Dashboard</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">Live Operations</Badge>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="live">Live View</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="pods">Pods & Notes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Calls</CardTitle>
                <Phone className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{currentCalls.length}</div>
                <p className="text-xs text-muted-foreground">Active now</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">8 completed, 4 pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">Out of 23 total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">2</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Current Calls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 border rounded bg-green-50">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{call.startup[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{call.startup}</p>
                        <p className="text-sm text-muted-foreground">with {call.mentor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-600">{call.duration}</Badge>
                    </div>
                  </div>
                ))}
                {currentCalls.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No active calls</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm">
                    {activity.type === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {activity.type === 'cancelled' && <AlertCircle className="h-4 w-4 text-red-600" />}
                    {activity.type === 'scheduled' && <Calendar className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'feedback' && <Users className="h-4 w-4 text-purple-600" />}
                    <div className="flex-1">
                      <p>{activity.startup} - {activity.mentor}</p>
                      <p className="text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{activity.type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Scheduled Calls</CardTitle>
              <CardDescription>View and manage upcoming sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Search by startup or mentor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <div className="space-y-3">
                {filteredCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{call.startup[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{call.startup}</p>
                        <p className="text-sm text-muted-foreground">with {call.mentor}</p>
                        <p className="text-sm text-muted-foreground">{call.date} at {call.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          call.status === 'confirmed' ? 'default' : 
                          call.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {call.status}
                      </Badge>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pods" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <Label htmlFor="pod-filter">Filter by Pod:</Label>
            <select 
              id="pod-filter"
              value={selectedPod}
              onChange={(e) => setSelectedPod(e.target.value)}
              className="bg-background border border-border rounded px-3 py-2"
            >
              <option value="all">All Pods</option>
              {pods.map(pod => (
                <option key={pod.id} value={pod.name}>{pod.name}</option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pod Call Management & Notes</CardTitle>
              <CardDescription>Track calls per pod and manage meeting notes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Startup</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Pod</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCallsByPod.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{call.startup[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{call.startup}</span>
                        </div>
                      </TableCell>
                      <TableCell>{call.mentor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{call.pod}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{call.date}</p>
                          <p className="text-xs text-muted-foreground">{call.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>{call.duration}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {call.hasNotes ? (
                            <Badge className="bg-green-600">Notes Available</Badge>
                          ) : (
                            <Badge variant="secondary">No Notes</Badge>
                          )}
                          {call.notesUploaded ? (
                            <Badge className="bg-blue-600">Uploaded</Badge>
                          ) : call.hasNotes ? (
                            <Badge variant="destructive">Pending Upload</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {call.hasNotes && !call.notesUploaded && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUploadNotes(call.id)}
                              disabled={uploadingNotes}
                            >
                              <Upload className="mr-1 h-3 w-3" />
                              Upload
                            </Button>
                          )}
                          {call.hasNotes && (
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Share
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {pods.map(pod => (
              <Card key={pod.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{pod.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Calls This Week:</span>
                      <span className="font-bold">
                        {filteredCallsByPod.filter(call => call.pod === pod.name).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Notes Uploaded:</span>
                      <span className="font-bold text-green-600">
                        {filteredCallsByPod.filter(call => call.pod === pod.name && call.notesUploaded).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending Notes:</span>
                      <span className="font-bold text-red-600">
                        {filteredCallsByPod.filter(call => call.pod === pod.name && call.hasNotes && !call.notesUploaded).length}
                      </span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">Startups:</p>
                      <div className="flex flex-wrap gap-1">
                        {pod.startups.map(startup => (
                          <Badge key={startup} variant="outline" className="text-xs">
                            {startup}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Completed Sessions (This Month)</span>
                  <span className="font-bold">156</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled Sessions</span>
                  <span className="font-bold text-red-600">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Rescheduled Sessions</span>
                  <span className="font-bold text-yellow-600">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Session Duration</span>
                  <span className="font-bold">42 mins</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mentor Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Active Mentors</span>
                  <span className="font-bold">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Coaches</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Founder Mentors</span>
                  <span className="font-bold">10</span>
                </div>
                <div className="flex justify-between">
                  <span>Experts</span>
                  <span className="font-bold">5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Send Bulk Notifications</Button>
                <Button variant="outline" className="w-full">Export Session Data</Button>
                <Button variant="outline" className="w-full">Generate Reports</Button>
                <Button variant="outline" className="w-full">Manage Mentor Assignments</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Calendly Integration</span>
                  <Badge className="bg-green-600">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>WhatsApp Integration</span>
                  <Badge className="bg-green-600">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Badge className="bg-green-600">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <Badge className="bg-green-600">Online</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamDashboard;
