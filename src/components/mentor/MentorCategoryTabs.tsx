
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

interface MentorToggle {
  mentor_type: 'founder_mentor' | 'expert' | 'coach';
  is_visible: boolean;
}

interface MentorCategoryTabsProps {
  onSelectMentor: (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => void;
  selectedMentorId?: string;
}

const MentorCategoryTabs: React.FC<MentorCategoryTabsProps> = ({ 
  onSelectMentor, 
  selectedMentorId 
}) => {
  const [assignedMentors, setAssignedMentors] = useState<Mentor[]>([]);
  const [allExperts, setAllExperts] = useState<Mentor[]>([]);
  const [mentorToggles, setMentorToggles] = useState<MentorToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [startupId, setStartupId] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.id) {
      fetchMentorData();
    }
  }, [profile?.id]);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      console.log('Fetching mentor data for profile:', profile?.id);

      // First get the startup ID for the current user
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .select('id, startup_name')
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

      console.log('Found startup:', startup);
      setStartupId(startup.id);

      // Fetch mentor toggles to check visibility
      const { data: toggles, error: togglesError } = await supabase
        .from('mentor_toggles')
        .select('mentor_type, is_visible');

      if (togglesError) {
        console.error('Error fetching mentor toggles:', togglesError);
      } else {
        console.log('Mentor toggles:', toggles);
        setMentorToggles(toggles || []);
      }

      // Fetch assigned mentors (coaches and founder_mentors only)
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
        .eq('is_active', true)
        .in('mentors.mentor_type', ['coach', 'founder_mentor']);

      console.log('Assignments query result:', assignments);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        toast({
          title: "Error",
          description: "Failed to fetch your assigned mentors.",
          variant: "destructive"
        });
      } else {
        // Transform assigned mentors data
        const processedAssignedMentors: Mentor[] = assignments?.map((assignment: any) => ({
          id: assignment.mentors.id,
          mentor_type: assignment.mentors.mentor_type,
          years_experience: assignment.mentors.years_experience,
          specializations: assignment.mentors.specializations || [],
          profiles: assignment.mentors.profiles
        })) || [];

        console.log('Processed assigned mentors:', processedAssignedMentors);
        setAssignedMentors(processedAssignedMentors);
      }

      // Fetch ALL experts (not through assignments)
      const { data: experts, error: expertsError } = await supabase
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
            bio,
            expertise
          )
        `)
        .eq('mentor_type', 'expert');

      console.log('Experts query result:', experts);

      if (expertsError) {
        console.error('Error fetching experts:', expertsError);
      } else {
        // Transform experts data
        const processedExperts: Mentor[] = experts?.map((expert: any) => ({
          id: expert.id,
          mentor_type: expert.mentor_type,
          years_experience: expert.years_experience,
          specializations: expert.specializations || [],
          profiles: expert.profiles
        })) || [];

        console.log('Processed experts:', processedExperts);
        setAllExperts(processedExperts);
      }

    } catch (error) {
      console.error('Error fetching mentor data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mentors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isMentorTypeVisible = (mentorType: string) => {
    const toggle = mentorToggles.find(t => t.mentor_type === mentorType);
    const isVisible = toggle?.is_visible ?? true;
    console.log(`Mentor type ${mentorType} visibility:`, isVisible);
    return isVisible;
  };

  const getMentorsByType = (type: string) => {
    if (type === 'expert') {
      return allExperts;
    }
    return assignedMentors.filter(mentor => mentor.mentor_type === type);
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
              {mentorType === 'expert' 
                ? 'No experts available at the moment.'
                : `No ${title.toLowerCase()} assigned to your startup yet.`
              }
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
        <p className="mt-2 text-sm text-muted-foreground">Loading mentors...</p>
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

  // Filter visible tabs based on mentor toggles
  const visibleTabs = [
    { value: 'coaches', type: 'coach', title: 'Coaches', icon: Briefcase, description: 'Personal development and leadership coaching' },
    { value: 'founders', type: 'founder_mentor', title: 'Founder Mentors', icon: Users, description: 'Experienced founders who have built successful startups' },
    { value: 'experts', type: 'expert', title: 'Experts', icon: Star, description: 'Domain experts in specific fields and technologies' }
  ].filter(tab => isMentorTypeVisible(tab.type));

  if (visibleTabs.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No mentor categories are currently available.
        </p>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={visibleTabs[0]?.value} className="w-full">
      <TabsList className={`grid w-full grid-cols-${visibleTabs.length}`}>
        {visibleTabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center space-x-1">
            <tab.icon className="h-4 w-4" />
            <span>{tab.title}</span>
            <Badge variant="secondary" className="ml-1">
              {getMentorsByType(tab.type).length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {visibleTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          {renderMentorSection(
            tab.title,
            <tab.icon className="h-5 w-5 text-orange-500" />,
            tab.type,
            tab.description
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default MentorCategoryTabs;
