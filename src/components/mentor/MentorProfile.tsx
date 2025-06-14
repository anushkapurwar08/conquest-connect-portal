
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building, BookOpen, Star } from 'lucide-react';

interface MentorProfileProps {
  mentorId: string;
  onClose: () => void;
  onAddToWaitlist?: (mentorId: string) => void;
}

const MentorProfile: React.FC<MentorProfileProps> = ({ mentorId, onClose, onAddToWaitlist }) => {
  // Mock data - in real app this would come from API
  const mentorData = {
    name: 'John Smith',
    type: 'Founder Mentor',
    expertise: ['Product Strategy', 'Go-to-Market', 'Fundraising'],
    currentRole: 'Partner at TechVentures',
    pastCompanies: [
      { name: 'TechCorp', role: 'Founder & CEO', years: '2018-2023' },
      { name: 'InnovateLab', role: 'Head of Product', years: '2015-2018' },
      { name: 'StartupX', role: 'Product Manager', years: '2012-2015' }
    ],
    bio: 'Serial entrepreneur with 15+ years of experience building and scaling tech companies. Successfully raised $50M+ in funding and led teams of 100+ people.',
    achievements: [
      'Built and sold 2 companies',
      'Raised $50M+ in funding',
      'Mentored 50+ startups'
    ],
    availability: 'Limited slots available'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {mentorData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold">{mentorData.name}</h2>
            <p className="text-muted-foreground">{mentorData.currentRole}</p>
            <Badge className="mt-1">{mentorData.type}</Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          {onAddToWaitlist && (
            <Button 
              variant="outline" 
              onClick={() => onAddToWaitlist(mentorId)}
            >
              Add to Waitlist
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{mentorData.bio}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Expertise</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mentorData.expertise.map((skill, i) => (
                <Badge key={i} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Key Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {mentorData.achievements.map((achievement, i) => (
                <li key={i} className="text-sm">• {achievement}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Professional Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorData.pastCompanies.map((company, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-muted-foreground">{company.role}</p>
                </div>
                <Badge variant="outline">{company.years}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Status:</span>
            <Badge variant="outline">{mentorData.availability}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorProfile;
