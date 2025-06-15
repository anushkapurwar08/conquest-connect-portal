
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Mentor {
  id: string;
  mentor_type: 'founder_mentor' | 'expert' | 'coach';
  profiles: {
    first_name: string;
    last_name: string;
    username: string;
    bio: string;
    expertise: string[];
  };
  years_experience: number;
  specializations: string[];
}

interface MentorCategoryTabsProps {
  onSelectMentor: (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => void;
  selectedMentorId?: string;
}

const MentorCategoryTabs: React.FC<MentorCategoryTabsProps> = ({ 
  onSelectMentor, 
  selectedMentorId 
}) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [startupId, setStartupId] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.id) {
      fetchStartupAndMentors();
    }
  }, [profile?.id]);

  const fetchStartupAndMentors = async () => {
    try {
      setLoading(true);

      // First get the startup ID for the current user
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile?.id)
        .maybeSingle();

      if (startupError) {
        console.error('Error fetching startup:', startupError);
        return;
      }

      if (!startup) {
        console.log('No startup found for this user');
        return;
      }

      setStartupId(startup.id);

      // Fetch assigned mentors for this startup
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          mentor_id,
          mentors!inner(
            id,
            mentor_type,
            years_experience,
            specializations,
            profiles!inner(
              first_name,
              last_name,
              username,
              bio,
              expertise
            )
          )
        `)
        .eq('startup_id', startup.id)
        .eq('is_active', true);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        toast({
          title: "Error",
          description: "Failed to fetch your assigned mentors.",
          variant: "destructive"
        });
        return;
      }

      // Transform the data to match our Mentor interface
      const assignedMentors: Mentor[] = assignments?.map((assignment: any) => ({
        id: assignment.mentors.id,
        mentor_type: assignment.mentors.mentor_type,
        years_experience: assignment.mentors.years_experience,
        specializations: assignment.mentors.specializations || [],
        profiles: assignment.mentors.profiles
      })) || [];

      setMentors(assignedMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mentors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMentorsByType = (type: string) => {
    return mentors.filter(mentor => mentor.mentor_type === type);
  };

  const renderMentorCard = (mentor: Mentor) => {
    const displayName = mentor.profiles.first_name && mentor.profiles.last_name
      ? `${mentor.profiles.first_name} ${mentor.profiles.last_name}`
      : mentor.profiles.username;

    return (
      <Card 
        key={mentor.id} 
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedMentorId === mentor.id ? 'ring-2 ring-orange-500' : ''
        }`}
        onClick={() => onSelectMentor(mentor.id, mentor.mentor_type)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{displayName}</CardTitle>
          {mentor.years_experience && (
            <CardDescription>
              {mentor.years_experience} years of experience
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mentor.profiles.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {mentor.profiles.bio}
              </p>
            )}
            
            {mentor.profiles.expertise && mentor.profiles.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {mentor.profiles.expertise.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {mentor.profiles.expertise.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentor.profiles.expertise.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {mentor.specializations && mentor.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {mentor.specializations.slice(0, 2).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMentorSection = (title: string, icon: React.ReactNode, mentorType: string, description: string) => {
    const typeMentors = getMentorsByType(mentorType);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          {icon}
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        
        {typeMentors.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              No {title.toLowerCase()} assigned to your startup yet.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {typeMentors.map(renderMentorCard)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading your assigned mentors...</p>
      </div>
    );
  }

  if (!startupId) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No startup profile found. Please ensure your account is properly set up.
        </p>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="coaches" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="coaches" className="flex items-center space-x-1">
          <Briefcase className="h-4 w-4" />
          <span>Coaches</span>
          <Badge variant="secondary" className="ml-1">
            {getMentorsByType('coach').length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="founders" className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>Founder Mentors</span>
          <Badge variant="secondary" className="ml-1">
            {getMentorsByType('founder_mentor').length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="experts" className="flex items-center space-x-1">
          <Star className="h-4 w-4" />
          <span>Experts</span>
          <Badge variant="secondary" className="ml-1">
            {getMentorsByType('expert').length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="coaches" className="mt-6">
        {renderMentorSection(
          "Coaches", 
          <Briefcase className="h-5 w-5 text-orange-500" />,
          "coach",
          "Personal development and leadership coaching"
        )}
      </TabsContent>

      <TabsContent value="founders" className="mt-6">
        {renderMentorSection(
          "Founder Mentors", 
          <Users className="h-5 w-5 text-orange-500" />,
          "founder_mentor",
          "Experienced founders who have built successful startups"
        )}
      </TabsContent>

      <TabsContent value="experts" className="mt-6">
        {renderMentorSection(
          "Experts", 
          <Star className="h-5 w-5 text-orange-500" />,
          "expert",
          "Domain experts in specific fields and technologies"
        )}
      </TabsContent>
    </Tabs>
  );
};

export default MentorCategoryTabs;
