
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Users, Calendar, Eye, MessageSquare } from 'lucide-react';

const SharedMentorNotes = () => {
  const [selectedStartup, setSelectedStartup] = useState('TechFlow');

  const sharedNotes = [
    {
      startup: 'TechFlow',
      sessions: [
        {
          id: 1,
          date: 'Dec 18, 2024',
          mentors: ['John Smith', 'Sarah Johnson'],
          topic: 'Product Strategy & Market Analysis',
          notes: 'Discussed go-to-market strategy. John focused on product positioning while Sarah provided market insights.',
          sharedInsights: 'Both mentors agree on focusing on B2B segment first.',
          followUpNeeded: true
        },
        {
          id: 2,
          date: 'Dec 15, 2024',
          mentors: ['John Smith', 'Mike Chen'],
          topic: 'Technical Architecture Review',
          notes: 'John reviewed business logic, Mike provided technical architecture feedback.',
          sharedInsights: 'Recommended microservices approach for scalability.',
          followUpNeeded: false
        }
      ]
    },
    {
      startup: 'GreenStart',
      sessions: [
        {
          id: 3,
          date: 'Dec 19, 2024',
          mentors: ['Sarah Johnson', 'Lisa Wong'],
          topic: 'Sustainability Metrics & Health Impact',
          notes: 'Combined session covering environmental and health aspects of the product.',
          sharedInsights: 'Strong alignment on triple bottom line approach.',
          followUpNeeded: true
        }
      ]
    }
  ];

  const startupSessions = sharedNotes.find(s => s.startup === selectedStartup)?.sessions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Shared Mentor Notes</h3>
        <div className="flex items-center space-x-2">
          <label htmlFor="startup-select" className="text-sm font-medium">
            Startup:
          </label>
          <select
            id="startup-select"
            value={selectedStartup}
            onChange={(e) => setSelectedStartup(e.target.value)}
            className="bg-background border border-border rounded px-3 py-2"
          >
            {sharedNotes.map(s => (
              <option key={s.startup} value={s.startup}>{s.startup}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {startupSessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{session.topic}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {session.date}
                    </span>
                    <span className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {session.mentors.length} mentors
                    </span>
                  </CardDescription>
                </div>
                {session.followUpNeeded && (
                  <Badge variant="destructive">Follow-up Needed</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Participating Mentors:</h4>
                <div className="flex space-x-2">
                  {session.mentors.map(mentor => (
                    <div key={mentor} className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {mentor.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{mentor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Session Notes:</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {session.notes}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Shared Insights:</h4>
                <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                  {session.sharedInsights}
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline">
                  <Eye className="mr-1 h-3 w-3" />
                  View Full Notes
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  Add Comment
                </Button>
                <Button size="sm">
                  <FileText className="mr-1 h-3 w-3" />
                  Export Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SharedMentorNotes;
