import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Building, AlertCircle, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSchedulingRules } from '@/hooks/useSchedulingRules';

interface MentorData {
  id: string;
  mentor_type: string;
  years_experience: number | null;
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
  typeSpecific: string;
  availability: string;
  yearsExperience: number;
  specializations: string[];
}

interface MentorCategoryListProps {
  mentorType: 'founder_mentor' | 'expert' | 'coach';
  onSelectMentor: (mentorId: string) => void;
  selectedMentorId?: string;
}

const MentorCategoryList: React.FC<MentorCategoryListProps> = ({ 
  mentorType, 
  onSelectMentor, 
  selectedMentorId 
}) => {
  const [mentors, setMentors] = useState<ProcessedMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isMentorTypeVisible, loading: rulesLoading } = useSchedulingRules();

  // Helper functions - moved to top to avoid hoisting issues
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

  useEffect(() => {
    fetchMentors();
  }, [mentorType]);

  // Check if this mentor type is visible to users
  const isVisible = isMentorTypeVisible(mentorType);

  // If mentor type is not visible, show admin message
  if (!rulesLoading && !isVisible) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{getCategoryTitle()}</h3>
          <p className="text-muted-foreground text-sm">{getCategoryDescription()}</p>
        </div>
        <div className="text-center py-8">
          <EyeOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">This mentor category is currently unavailable</h3>
          <p className="text-muted-foreground mb-4">
            {getCategoryTitle()} are temporarily hidden by administrators.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check back later or contact support if you need assistance.
          </p>
        </div>
      </div>
    );
  }

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching mentors for type:', mentorType);
      
      const { data: mentorsData, error } = await supabase
        .from('mentors')
        .select(`
          id,
          mentor_type,
          years_experience,
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
        .eq('mentor_type', mentorType)
        .not('profiles', 'is', null);

      if (error) {
        console.error('Error fetching mentors:', error);
        setError(`Failed to load mentors: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to load mentors. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched mentors data:', mentorsData);

      if (!mentorsData || mentorsData.length === 0) {
        console.log('No mentors found for type:', mentorType);
        setMentors([]);
        return;
      }

      // Validate mentor data before processing
      const validMentors = mentorsData.filter(mentor => {
        if (!mentor.profiles) {
          console.warn('Mentor missing profile data:', mentor.id);
          return false;
        }
        return true;
      });

      const processedMentors = validMentors.map((mentor: MentorData) => {
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
          typeSpecific: getTypeSpecific(mentor.mentor_type),
          availability: getAvailability(mentor.mentor_type),
          yearsExperience: mentor.years_experience || 5,
          specializations: mentor.specializations || []
        };
      });

      setMentors(processedMentors);
    } catch (error) {
      console.error('Unexpected error fetching mentors:', error);
      setError('An unexpected error occurred while loading mentors.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentor = async (mentorId: string) => {
    try {
      // Verify mentor exists and is valid before proceeding
      const mentor = mentors.find(m => m.id === mentorId);
      if (!mentor) {
        toast({
          title: "Error",
          description: "Selected mentor is not available.",
          variant: "destructive"
        });
        return;
      }

      console.log('Selecting mentor:', mentor);
      onSelectMentor(mentorId);
    } catch (error) {
      console.error('Error selecting mentor:', error);
      toast({
        title: "Error",
        description: "Failed to select mentor. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{getCategoryTitle()}</h3>
          <p className="text-muted-foreground text-sm">{getCategoryDescription()}</p>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Mentors</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              fetchMentors();
            }}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
                          <span>{mentor.yearsExperience} years exp.</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 text-xs font-medium">{mentor.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleSelectMentor(mentor.id)}
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
