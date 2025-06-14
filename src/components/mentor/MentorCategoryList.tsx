
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Calendar, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MentorData {
  id: string;
  mentor_type: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    username: string;
    expertise: string[] | null;
    title: string | null;
  } | null;
}

interface ProcessedMentor {
  id: string;
  name: string;
  expertise: string[];
  currentRole: string;
  rating: number;
  sessionsCompleted: number;
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
  const [mentors, setMentors] = useState<ProcessedMentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, [mentorType]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      console.log('Fetching mentors for type:', mentorType);
      
      const { data: mentorsData, error } = await supabase
        .from('mentors')
        .select(`
          id,
          mentor_type,
          profiles!inner(
            first_name,
            last_name,
            username,
            expertise,
            title
          )
        `)
        .eq('mentor_type', mentorType);

      if (error) {
        console.error('Error fetching mentors:', error);
        toast({
          title: "Error",
          description: "Failed to load mentors. Please try again.",
          variant: "destructive"
        });
        setMentors(getFallbackMentors());
        return;
      }

      console.log('Fetched mentors data:', mentorsData);

      if (!mentorsData || mentorsData.length === 0) {
        console.log('No mentors found, using fallback data');
        setMentors(getFallbackMentors());
        return;
      }

      const processedMentors = mentorsData.map((mentor: MentorData) => {
        const profile = mentor.profiles;
        const name = profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : profile?.username || 'Unknown Mentor';

        return {
          id: mentor.id,
          name,
          expertise: profile?.expertise || ['General Mentoring'],
          currentRole: profile?.title || 'Mentor',
          rating: 4.8, // Mock data - could be calculated from reviews
          sessionsCompleted: Math.floor(Math.random() * 200) + 50, // Mock data
          typeSpecific: getTypeSpecific(mentor.mentor_type),
          availability: getAvailability(mentor.mentor_type)
        };
      });

      setMentors(processedMentors);
    } catch (error) {
      console.error('Unexpected error fetching mentors:', error);
      setMentors(getFallbackMentors());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackMentors = (): ProcessedMentor[] => {
    // Fallback data in case database is empty
    const baseMentors = [
      {
        id: 'fallback-1',
        name: 'Sarah Johnson',
        expertise: ['Product Strategy', 'Go-to-Market'],
        currentRole: 'Former CEO at TechCorp',
        rating: 4.9,
        sessionsCompleted: 156
      },
      {
        id: 'fallback-2',
        name: 'Michael Chen',
        expertise: ['Engineering', 'Team Building'],
        currentRole: 'CTO at StartupX',
        rating: 4.8,
        sessionsCompleted: 89
      }
    ];

    return baseMentors.map(mentor => ({
      ...mentor,
      typeSpecific: getTypeSpecific(mentorType),
      availability: getAvailability(mentorType)
    }));
  };

  const getTypeSpecific = (type: string): string => {
    switch (type) {
      case 'founder_mentor':
        return 'Serial Entrepreneur';
      case 'expert':
        return 'Industry Expert';
      case 'coach':
        return 'Executive Coach';
      default:
        return 'Mentor';
    }
  };

  const getAvailability = (type: string): string => {
    switch (type) {
      case 'founder_mentor':
        return 'Limited slots';
      case 'expert':
        return 'Available this week';
      case 'coach':
        return 'Recurring sessions';
      default:
        return 'Available';
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{getCategoryTitle()}</h3>
          <p className="text-muted-foreground text-sm">{getCategoryDescription()}</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{getCategoryTitle()}</h3>
        <p className="text-muted-foreground text-sm">{getCategoryDescription()}</p>
      </div>
      
      <div className="grid gap-4">
        {mentors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No mentors available in this category</p>
            <p className="text-sm">Please check back later</p>
          </div>
        ) : (
          mentors.map((mentor) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default MentorCategoryList;
