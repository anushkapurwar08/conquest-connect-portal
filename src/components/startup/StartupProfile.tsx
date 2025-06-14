
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink, Linkedin, Globe, Users, DollarSign, Target, Building } from 'lucide-react';

interface StartupProfileProps {
  startupId: string;
  onClose: () => void;
}

const StartupProfile: React.FC<StartupProfileProps> = ({ startupId, onClose }) => {
  // Mock data - in real app this would come from API
  const startupData = {
    name: 'TechFlow',
    sector: 'EdTech',
    mission: 'Revolutionizing online education through AI-powered personalized learning experiences',
    amountRaised: '$250K',
    stage: 'Pre-Seed',
    website: 'https://techflow.com',
    prototype: 'MVP Ready',
    clients: ['Stanford University', 'MIT', 'Harvard Business School'],
    founders: [
      {
        name: 'John Doe',
        role: 'CEO & Co-founder',
        linkedin: 'https://linkedin.com/in/johndoe',
        background: 'Ex-Google, Stanford MBA'
      },
      {
        name: 'Jane Smith',
        role: 'CTO & Co-founder',
        linkedin: 'https://linkedin.com/in/janesmith',
        background: 'Ex-Meta, MIT Computer Science'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{startupData.name}</h2>
          <p className="text-muted-foreground">{startupData.sector} • {startupData.stage}</p>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{startupData.mission}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Funding</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Amount Raised:</strong> {startupData.amountRaised}</p>
              <p><strong>Stage:</strong> {startupData.stage}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Product & Market</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Prototype Status:</strong> {startupData.prototype}</p>
              <p><strong>Sector:</strong> {startupData.sector}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Key Clients</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {startupData.clients.map((client, i) => (
                <Badge key={i} variant="secondary">{client}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Founders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {startupData.founders.map((founder, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                <Avatar>
                  <AvatarFallback>{founder.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{founder.name}</p>
                  <p className="text-sm text-muted-foreground">{founder.role}</p>
                  <p className="text-xs text-muted-foreground">{founder.background}</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={founder.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <a href={startupData.website} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                Website
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartupProfile;
