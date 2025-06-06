
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Clock, BookOpen, Phone } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const StartupDashboard = () => {
  const [selectedMentor, setSelectedMentor] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const handleBookSlot = () => {
    toast({
      title: "Booking Confirmed",
      description: "Your slot has been booked successfully. You'll receive a confirmation email shortly.",
    });
  };

  const handleSendSuggestion = () => {
    toast({
      title: "Message Sent",
      description: "Your suggestion has been sent to the team.",
    });
    setSuggestion('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Startup Dashboard</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">Cohort 2024-1</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="booking">Book Slots</TabsTrigger>
          <TabsTrigger value="mentors">My Mentors</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="cohort">Cohort</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Calls</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Next: Tomorrow 2 PM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Assigned to you</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Due this week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My Scheduled Calls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>M{i}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Mentor {i}</p>
                        <p className="text-sm text-muted-foreground">Dec {20 + i}, 2024 - 2:00 PM</p>
                      </div>
                    </div>
                    <Badge>Scheduled</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleBookSlot}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book New Session
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Conquest POC
                </Button>
                <Button variant="outline" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Resources
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book a Mentor Session</CardTitle>
              <CardDescription>Select a mentor and book an available slot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="mentor-select">Select Mentor</Label>
                  <select 
                    id="mentor-select"
                    value={selectedMentor}
                    onChange={(e) => setSelectedMentor(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="">Choose a mentor...</option>
                    <option value="john">John Smith - Product Strategy</option>
                    <option value="sarah">Sarah Johnson - Marketing</option>
                    <option value="mike">Mike Chen - Technology</option>
                  </select>
                </div>
                
                <div>
                  <Label>Available This Week</Label>
                  <div className="mt-1 space-y-2">
                    {['Dec 21 - 2:00 PM', 'Dec 22 - 10:00 AM', 'Dec 23 - 4:00 PM'].map((slot, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={handleBookSlot}>
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Label htmlFor="calendly-link">Or use direct Calendly link</Label>
                <Input 
                  id="calendly-link"
                  placeholder="Paste mentor's Calendly link here" 
                  className="mt-1"
                />
                <Button className="mt-2" onClick={handleBookSlot}>Book via Calendly</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Team / Send Suggestion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Type your suggestion or query here..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
              />
              <Button onClick={handleSendSuggestion}>Send to Team</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: 'John Smith', role: 'Product Strategy', type: 'Founder Mentor' },
                  { name: 'Sarah Johnson', role: 'Marketing', type: 'Expert' },
                  { name: 'Mike Chen', role: 'Technology', type: 'Coach' },
                  { name: 'Lisa Wong', role: 'Finance', type: 'Expert' }
                ].map((mentor, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{mentor.name}</p>
                        <p className="text-sm text-muted-foreground">{mentor.role}</p>
                        <Badge variant="secondary" className="text-xs">{mentor.type}</Badge>
                      </div>
                    </div>
                    <Button size="sm">Book Session</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resources Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  'Startup Toolkit', 'Market Research Guide', 'Pitch Deck Template', 'Financial Planning',
                  'Legal Resources', 'Technical Documentation', 'Marketing Playbook', 'Customer Discovery'
                ].map((resource, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <span>{resource}</span>
                    <Button size="sm" variant="outline">Download</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Startups in Cohort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['TechFlow', 'GreenStart', 'DataDrive', 'HealthTech Plus'].map((startup, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <span>{startup}</span>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Pod</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['TechFlow', 'GreenStart'].map((startup, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <span>{startup}</span>
                      <Button size="sm">Chat</Button>
                    </div>
                  ))}
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
