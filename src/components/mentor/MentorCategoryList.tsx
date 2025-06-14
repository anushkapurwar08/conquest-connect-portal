
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Calendar, Star } from 'lucide-react';

interface BaseMentor {
  id: string;
  name: string;
  expertise: string[];
  currentRole: string;
  rating: number;
  sessionsCompleted: number;
}

interface EnhancedMentor extends BaseMentor {
  typeSpecific: string;
  availability: string;
}

interface MentorCategoryListProps {
  mentorType: 'founder_mentor' | 'expert' | 'coach';
  onSelectMentor: (mentorId: string) => void;
  onOpenProfile: (mentorId: string) => void;
  selectedMentorId?: string;
}

const MentorCategoryList: React.FC<MentorCategoryListProps> = ({ 
  mentorType, 
  onSelectMentor, 
  onOpenProfile,
  selectedMentorId 
}) => {
  // Mock data - in real app this would come from API filtered by mentor_type
  const getMentorsByType = (): EnhancedMentor[] => {
    const baseMentors: BaseMentor[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        expertise: ['Product Strategy', 'Go-to-Market'],
        currentRole: 'Former CEO at TechCorp',
        rating: 4.9,
        sessionsCompleted: 156
      },
      {
        id: '2',
        name: 'Michael Chen',
        expertise: ['Engineering', 'Team Building'],
        currentRole: 'CTO at StartupX',
        rating: 4.8,
        sessionsCompleted: 89
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        expertise: ['Marketing', 'Brand Strategy'],
        currentRole: 'VP Marketing at GrowthCo',
        rating: 4.7,
        sessionsCompleted: 203
      }
    ];

    // Customize based on mentor type
    switch (mentorType) {
      case 'founder_mentor':
        return baseMentors.map(mentor => ({
          ...mentor,
          typeSpecific: 'Serial Entrepreneur',
          availability: 'Limited slots'
        }));
      case 'expert':
        return baseMentors.map(mentor => ({
          ...mentor,
          typeSpecific: 'Industry Expert',
          availability: 'Available this week'
        }));
      case 'coach':
        return baseMentors.map(mentor => ({
          ...mentor,
          typeSpecific: 'Executive Coach',
          availability: 'Recurring sessions'
        }));
      default:
        return baseMentors.map(mentor => ({
          ...mentor,
          typeSpecific: 'Mentor',
          availability: 'Available'
        }));
    }
  };

  const mentors = getMentorsByType();

  const getCategoryTitle = () => {
    switch (mentorType) {
      case 'founder_mentor':
        return 'Founder Mentors';
      case 'expert':
        return 'Industry Experts';
      case 'coach':
        return 'Executive Coaches';
      default:
        return 'Mentors';
    }
  };

  const getCategoryDescription = () => {
    switch (mentorType) {
      case 'founder_mentor':
        return 'Experienced founders who have built and scaled companies';
      case 'expert':
        return 'Subject matter experts with deep domain knowledge';
      case 'coach':
        return 'Professional coaches focused on leadership and personal development';
      default:
        return 'Professional mentors';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{getCategoryTitle()}</h3>
        <p className="text-muted-foreground text-sm">{getCategoryDescription()}</p>
      </div>
      
      <div className="grid gap-4">
        {mentors.map((mentor) => (
          <Card 
            key={mentor.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMentorId === mentor.id ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{mentor.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {mentor.typeSpecific}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {mentor.currentRole}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.expertise.slice(0, 2).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{mentor.expertise.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{mentor.rating}</span>
                      </div>
                      <span>{mentor.sessionsCompleted} sessions</span>
                      <span className="text-green-600">{mentor.availability}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenProfile(mentor.id)}
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSelectMentor(mentor.id)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentorCategoryList;
