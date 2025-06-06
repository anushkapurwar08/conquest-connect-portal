import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Clock, Settings, ExternalLink, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import SharedMentorNotes from './SharedMentorNotes';
import PostCallFollowUp from './PostCallFollowUp';

const MentorDashboard = () => {
  const [calendlyLink, setCalendlyLink] = useState('');
  const [mentorType] = useState('coach'); // Can be 'coach', 'founder-mentor', 'expert'
  const [showPostCallModal, setShowPostCallModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  const handleUpdateCalendly = () => {
    toast({
      title: "Calendly Updated",
      description: "Your availability has been updated successfully.",
    });
  };

  const getAssignedStartups = () => {
    if (mentorType === 'coach') return 2;
    if (mentorType === 'founder-mentor') return 8;
    return 'Various'; // for experts
  };

  const openPostCallFollowUp = (call: any) => {
    setSelectedCall(call);
    setShowPostCallModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Mentor Dashboard</h2>
        <Badge variant="outline" className="text-lg px-3 py-1 capitalize">
          {mentorType === 'founder-mentor' ? 'Founder Mentor' : mentorType}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="startups">My Startups</TabsTrigger>
          <TabsTrigger value="notes">Shared Notes</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Calls</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Startups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAssignedStartups()}</div>
                <p className="text-xs text-muted-foreground">Active mentoring</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback Forms</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Calls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { startup: 'TechFlow', time: 'Dec 21, 2:00 PM', status: 'Confirmed' },
                  { startup: 'GreenStart', time: 'Dec 22, 10:00 AM', status: 'Confirmed' },
                  { startup: 'DataDrive', time: 'Dec 23, 4:00 PM', status: 'Pending' }
                ].map((call, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{call.startup}</p>
                      <p className="text-sm text-muted-foreground">{call.time}</p>
                    </div>
                    <Badge variant={call.status === 'Confirmed' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Session completed with TechFlow</p>
                  <p className="text-muted-foreground">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">New booking from GreenStart</p>
                  <p className="text-muted-foreground">5 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Feedback form submitted</p>
                  <p className="text-muted-foreground">1 day ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Your Availability</CardTitle>
              <CardDescription>Manage your Calendly link and available slots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="calendly">Calendly Link</Label>
                <Input 
                  id="calendly"
                  value={calendlyLink}
                  onChange={(e) => setCalendlyLink(e.target.value)}
                  placeholder="https://calendly.com/your-link"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleUpdateCalendly}>Update Availability</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Monday: 2:00 PM - 5:00 PM',
                  'Wednesday: 10:00 AM - 12:00 PM',
                  'Friday: 3:00 PM - 6:00 PM'
                ].map((slot, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <span>{slot}</span>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="startups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Startups ({getAssignedStartups()})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {(mentorType === 'coach' ? 
                  [
                    { name: 'TechFlow', founder: 'John Doe', lastSession: '2 days ago', hasPostCall: true },
                    { name: 'GreenStart', founder: 'Jane Smith', lastSession: '1 week ago', hasPostCall: false }
                  ] :
                  [
                    { name: 'TechFlow', founder: 'John Doe', lastSession: '2 days ago', hasPostCall: true },
                    { name: 'GreenStart', founder: 'Jane Smith', lastSession: '1 week ago', hasPostCall: false },
                    { name: 'DataDrive', founder: 'Mike Johnson', lastSession: '3 days ago', hasPostCall: true },
                    { name: 'HealthTech', founder: 'Sarah Wilson', lastSession: '5 days ago', hasPostCall: false },
                    { name: 'EduStart', founder: 'Chris Brown', lastSession: '1 week ago', hasPostCall: true },
                    { name: 'FinTech Pro', founder: 'Lisa Chen', lastSession: '4 days ago', hasPostCall: false },
                    { name: 'AI Solutions', founder: 'David Kim', lastSession: '2 days ago', hasPostCall: true },
                    { name: 'CleanEnergy', founder: 'Emma Davis', lastSession: '6 days ago', hasPostCall: false }
                  ].slice(0, mentorType === 'founder-mentor' ? 8 : 4)
                ).map((startup, i) => (
                  <div key={i} className="p-4 border rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{startup.name}</p>
                        <p className="text-sm text-muted-foreground">{startup.founder}</p>
                        <p className="text-xs text-muted-foreground">Last session: {startup.lastSession}</p>
                        {startup.hasPostCall && (
                          <Badge className="bg-green-600 mt-1">Post-call available</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        WhatsApp
                      </Button>
                      <Button size="sm" variant="outline">Schedule Call</Button>
                      {startup.hasPostCall && (
                        <Button 
                          size="sm" 
                          onClick={() => openPostCallFollowUp(startup)}
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          Post-Call
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <SharedMentorNotes />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Forms</CardTitle>
              <CardDescription>Submit feedback for completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { startup: 'TechFlow', session: 'Product Strategy', date: 'Dec 19, 2024' },
                  { startup: 'GreenStart', session: 'Market Analysis', date: 'Dec 18, 2024' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.startup} - {item.session}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <Button size="sm">Submit Feedback</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Type your message to the Conquest team..." />
                <Button>Send Message</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Raise a Query</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select className="w-full p-2 border rounded">
                  <option>Technical Issue</option>
                  <option>Scheduling Conflict</option>
                  <option>Startup Concern</option>
                  <option>Other</option>
                </select>
                <Textarea placeholder="Describe your query..." />
                <Button>Submit Query</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Post-Call Follow-Up Modal */}
      {showPostCallModal && selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Post-Call Follow-Up</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPostCallModal(false)}
                >
                  Close
                </Button>
              </div>
              <PostCallFollowUp
                callId="call-123"
                startup={selectedCall.name}
                mentor="Current Mentor"
                date={selectedCall.lastSession}
                userRole="mentor"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
