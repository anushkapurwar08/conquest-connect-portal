
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Calendar, Star, Building, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MentorData {
  id: string;
  mentor_type: string;
  years_experience: number | null;
  hourly_rate: number | null;
  specializations: string[] | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    username: string;
    expertise: string[] | null;
    title: string | null;
    company: string | null;
    bio: string | null;
  } | null;
}

interface ProcessedMentor {
  id: string;
  name: string;
  expertise: string[];
  currentRole: string;
  company: string;
  bio: string;
  rating: number;
  sessionsCompleted: number;
  typeSpecific: string;
  availability: string;
  yearsExperience: number;
  hourlyRate: number;
  specializations: string[];
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
          years_experience,
          hourly_rate,
          specializations,
          profiles!inner(
            first_name,
            last_name,
            username,
            expertise,
            title,
            company,
            bio
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
          company: profile?.company || 'Independent',
          bio: profile?.bio || 'Experienced mentor ready to help your startup grow.',
          rating: 4.8 + Math.random() * 0.4, // Mock data between 4.8-5.2
          sessionsCompleted: Math.floor(Math.random() * 200) + 50,
          typeSpecific: getTypeSpecific(mentor.mentor_type),
          availability: getAvailability(mentor.mentor_type),
          yearsExperience: mentor.years_experience || 5,
          hourlyRate: mentor.hourly_rate || 200,
          specializations: mentor.specializations || []
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
    // Enhanced fallback data
    const baseMentors = [
      {
        id: 'fallback-1',
        name: 'Sarah Johnson',
        expertise: ['Product Strategy', 'Go-to-Market', 'Fundraising'],
        currentRole: 'Former CEO at TechCorp',
        company: 'TechCorp (Acquired)',
        bio: 'Serial entrepreneur with 3 successful exits. Expert in scaling B2B SaaS companies.',
        rating: 4.9,
        sessionsCompleted: 156,
        yearsExperience: 15,
        hourlyRate: 500,
        specializations: ['B2B SaaS', 'Series A-C']
      },
      {
        id: 'fallback-2',
        name: 'Michael Chen',
        expertise: ['Engineering', 'Team Building', 'Architecture'],
        currentRole: 'CTO at ScaleX',
        company: 'ScaleX Technologies',
        bio: 'Former Google engineer, now CTO helping technical founders scale their teams.',
        rating: 4.8,
        sessionsCompleted: 89,
        yearsExperience: 12,
        hourlyRate: 350,
        specializations: ['Backend Systems', 'Cloud Architecture']
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
      
      <div className="grid gap-6">
        {mentors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No mentors available in this category</p>
            <p className="text-sm">Please check back later</p>
          </div>
        ) : (
          mentors.map((mentor) => (
            <Card 
              key={mentor.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-l-4 border-l-orange-500 ${
                selectedMentorId === mentor.id ? 'ring-2 ring-orange-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-lg font-semibold">
                        {mentor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900">{mentor.name}</h4>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {mentor.typeSpecific}
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          {mentor.currentRole}
                          {mentor.company && (
                            <>
                              <Building className="h-3 w-3 mx-2 text-gray-400" />
                              <span className="text-gray-600">{mentor.company}</span>
                            </>
                          )}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {mentor.bio.length > 120 ? `${mentor.bio.substring(0, 120)}...` : mentor.bio}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-gray-100">
                              {skill}
                            </Badge>
                          ))}
                          {mentor.expertise.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100">
                              +{mentor.expertise.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        {mentor.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {mentor.specializations.slice(0, 2).map((spec, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-blue-700 border-blue-200">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                          </div>
                          <span>{mentor.sessionsCompleted} sessions</span>
                          <span>{mentor.yearsExperience} years exp.</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">${mentor.hourlyRate}/hr</span>
                          </div>
                          <span className="text-green-600 text-xs font-medium">{mentor.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenProfile(mentor.id)}
                      className="min-w-[100px]"
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSelectMentor(mentor.id)}
                      className="bg-orange-500 hover:bg-orange-600 min-w-[100px]"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Start Chat
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
