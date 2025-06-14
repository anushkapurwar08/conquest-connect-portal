
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, MessageSquare, Phone, FileText, Clock, Settings, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import WaitlistManager from '@/components/waitlist/WaitlistManager';

const TeamDashboard = () => {
  const [selectedPod, setSelectedPod] = useState('all');
  const [uploadingNotes, setUploadingNotes] = useState(false);

  // Mock data for calls per pod
  const podCalls = {
    'pod-a': [
      { id: '1', startup: 'TechFlow', mentor: 'John Smith', date: '2024-12-20', time: '2:00 PM', status: 'completed', hasNotes: true },
      { id: '2', startup: 'GreenStart', mentor: 'Sarah Johnson', date: '2024-12-21', time: '10:00 AM', status: 'scheduled', hasNotes: false }
    ],
    'pod-b': [
      { id: '3', startup: 'DataDrive', mentor: 'Mike Chen', date: '2024-12-20', time: '3:00 PM', status: 'completed', hasNotes: false },
      { id: '4', startup: 'HealthTech', mentor: 'Lisa Wong', date: '2024-12-22', time: '1:00 PM', status: 'scheduled', hasNotes: false }
    ]
  };

  const getAllCalls = () => {
    return Object.values(podCalls).flat();
  };

  const getCallsForPod = (podId: string) => {
    return podCalls[podId] || [];
  };

  const handleUploadNotes = (callId: string) => {
    setUploadingNotes(true);
    setTimeout(() => {
      setUploadingNotes(false);
      toast({
        title: "Notes Uploaded",
        description: "Meeting notes have been uploaded and shared with relevant mentors.",
      });
    }, 2000);
  };

  const displayCalls = selectedPod === 'all' ? getAllCalls() : getCallsForPod(selectedPod);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Team Dashboard</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">Operations View</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calls">All Calls</TabsTrigger>
          <TabsTrigger value="pods">Pod Management</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="notes">Notes Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls Today</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">8 completed, 4 scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">Across all pods</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Notes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Need to be uploaded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waitlist Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Pending action</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayCalls.slice(0, 5).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{call.startup} × {call.mentor}</p>
                        <p className="text-sm text-muted-foreground">{call.date} at {call.time}</p>
                      </div>
                      <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                        {call.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span>3 startups added John Smith to waitlist</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>Meeting notes missing for 2 sessions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span>New mentor Sarah Wilson joined</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Scheduled & Completed Calls</CardTitle>
              <CardDescription>Comprehensive view of all mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Startup</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getAllCalls().map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">{call.startup}</TableCell>
                      <TableCell>{call.mentor}</TableCell>
                      <TableCell>{call.date} {call.time}</TableCell>
                      <TableCell>
                        <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                          {call.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {call.hasNotes ? (
                          <Badge className="bg-green-600">Available</Badge>
                        ) : (
                          <Badge variant="outline">Missing</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          {call.status === 'completed' && !call.hasNotes && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUploadNotes(call.id)}
                              disabled={uploadingNotes}
                            >
                              Upload Notes
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pod-wise Call Management</CardTitle>
              <CardDescription>View and manage calls by pod</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pod-select">Select Pod</Label>
                <select 
                  id="pod-select"
                  value={selectedPod}
                  onChange={(e) => setSelectedPod(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="all">All Pods</option>
                  <option value="pod-a">Pod A</option>
                  <option value="pod-b">Pod B</option>
                  <option value="pod-c">Pod C</option>
                </select>
              </div>

              <div className="space-y-3">
                {displayCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{call.startup} × {call.mentor}</p>
                      <p className="text-sm text-muted-foreground">{call.date} at {call.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                        {call.status}
                      </Badge>
                      {call.status === 'completed' && !call.hasNotes && (
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          Add Notes
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          <WaitlistManager userRole="team" />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Notes Management</CardTitle>
              <CardDescription>Upload and distribute meeting notes to mentors and pods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="session-select">Select Session</Label>
                  <select id="session-select" className="w-full mt-1 p-2 border rounded">
                    <option>TechFlow × John Smith - Dec 20, 2024</option>
                    <option>GreenStart × Sarah Johnson - Dec 19, 2024</option>
                    <option>DataDrive × Mike Chen - Dec 18, 2024</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="file-upload">Upload Notes</Label>
                  <Input id="file-upload" type="file" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes-content">Or Add Notes Directly</Label>
                <Textarea 
                  id="notes-content"
                  placeholder="Enter meeting notes here..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button>Upload to Mentor Profile</Button>
                <Button variant="outline">Share with Pod</Button>
                <Button variant="outline">Archive</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Call Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Calls This Month:</span>
                    <span className="font-bold">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per Day:</span>
                    <span className="font-bold">7.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-bold">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>No-show Rate:</span>
                    <span className="font-bold">6%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pod Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pod A:</span>
                    <span className="font-bold">98% completion</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pod B:</span>
                    <span className="font-bold">92% completion</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pod C:</span>
                    <span className="font-bold">89% completion</span>
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

export default TeamDashboard;
