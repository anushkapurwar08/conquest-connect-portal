
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp } from 'lucide-react';
import MentorCategoryList from './MentorCategoryList';
import { supabase } from '@/integrations/supabase/client';

interface MentorCategoryTabsProps {
  onSelectMentor: (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => void;
  selectedMentorId?: string;
}

const MentorCategoryTabs: React.FC<MentorCategoryTabsProps> = ({ 
  onSelectMentor, 
  selectedMentorId 
}) => {
  const [activeTab, setActiveTab] = useState<'founder_mentor' | 'expert' | 'coach'>('founder_mentor');
  const [mentorCounts, setMentorCounts] = useState({
    founder_mentor: 0,
    expert: 0,
    coach: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorCounts();
  }, []);

  const fetchMentorCounts = async () => {
    try {
      setLoading(true);
      console.log('Fetching mentor counts...');
      
      const { data, error } = await supabase
        .from('mentors')
        .select('mentor_type, profiles!inner(id)')
        .not('profiles', 'is', null);

      if (error) {
        console.error('Error fetching mentor counts:', error);
        return;
      }

      console.log('Mentor counts data:', data);

      const counts = {
        founder_mentor: 0,
        expert: 0,
        coach: 0
      };

      data?.forEach(mentor => {
        if (mentor.mentor_type in counts) {
          counts[mentor.mentor_type as keyof typeof counts]++;
        }
      });

      console.log('Calculated counts:', counts);
      setMentorCounts(counts);
    } catch (error) {
      console.error('Error fetching mentor counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentor = (mentorId: string) => {
    onSelectMentor(mentorId, activeTab);
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="founder_mentor" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Founder Mentors</span>
          <Badge variant="secondary" className="ml-1">
            {loading ? '...' : mentorCounts.founder_mentor}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="expert" className="flex items-center space-x-2">
          <Target className="h-4 w-4" />
          <span>Experts</span>
          <Badge variant="secondary" className="ml-1">
            {loading ? '...' : mentorCounts.expert}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="coach" className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>Coaches</span>
          <Badge variant="secondary" className="ml-1">
            {loading ? '...' : mentorCounts.coach}
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="founder_mentor" className="mt-6">
        <MentorCategoryList
          mentorType="founder_mentor"
          onSelectMentor={handleSelectMentor}
          selectedMentorId={selectedMentorId}
        />
      </TabsContent>
      
      <TabsContent value="expert" className="mt-6">
        <MentorCategoryList
          mentorType="expert"
          onSelectMentor={handleSelectMentor}
          selectedMentorId={selectedMentorId}
        />
      </TabsContent>
      
      <TabsContent value="coach" className="mt-6">
        <MentorCategoryList
          mentorType="coach"
          onSelectMentor={handleSelectMentor}
          selectedMentorId={selectedMentorId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MentorCategoryTabs;
