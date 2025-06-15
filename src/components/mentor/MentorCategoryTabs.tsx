
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp } from 'lucide-react';
import MentorCategoryList from './MentorCategoryList';
import { supabase } from '@/integrations/supabase/client';
import { useSchedulingRules } from '@/hooks/useSchedulingRules';

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
  
  const { isMentorTypeVisible, loading: rulesLoading } = useSchedulingRules();

  useEffect(() => {
    fetchMentorCounts();
  }, []);

  // Auto-switch to a visible tab if current tab becomes hidden
  useEffect(() => {
    if (!rulesLoading && !isMentorTypeVisible(activeTab)) {
      const visibleTabs: ('founder_mentor' | 'expert' | 'coach')[] = ['founder_mentor', 'expert', 'coach'];
      const firstVisibleTab = visibleTabs.find(tab => isMentorTypeVisible(tab));
      if (firstVisibleTab) {
        setActiveTab(firstVisibleTab);
      }
    }
  }, [activeTab, isMentorTypeVisible, rulesLoading]);

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

  // Get visible tabs based on admin toggles
  const getVisibleTabs = () => {
    const allTabs = [
      {
        value: 'founder_mentor' as const,
        label: 'Founder Mentors',
        icon: Users,
        count: mentorCounts.founder_mentor
      },
      {
        value: 'expert' as const,
        label: 'Experts',
        icon: Target,
        count: mentorCounts.expert
      },
      {
        value: 'coach' as const,
        label: 'Coaches',
        icon: TrendingUp,
        count: mentorCounts.coach
      }
    ];

    return allTabs.filter(tab => isMentorTypeVisible(tab.value));
  };

  const visibleTabs = getVisibleTabs();

  // If no tabs are visible, show a message
  if (!rulesLoading && visibleTabs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No mentor types are currently available.</p>
        <p className="text-sm text-muted-foreground mt-2">Please contact support if you need assistance.</p>
      </div>
    );
  }

  // If only one tab is visible, don't show tabs, just show the content
  if (!rulesLoading && visibleTabs.length === 1) {
    const singleTab = visibleTabs[0];
    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <singleTab.icon className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">{singleTab.label}</h3>
            <Badge variant="secondary">
              {loading ? '...' : singleTab.count}
            </Badge>
          </div>
        </div>
        <MentorCategoryList
          mentorType={singleTab.value}
          onSelectMentor={(mentorId) => onSelectMentor(mentorId, singleTab.value)}
          selectedMentorId={selectedMentorId}
        />
      </div>
    );
  }

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      className="w-full"
    >
      <TabsList className={`grid w-full grid-cols-${visibleTabs.length}`}>
        {visibleTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center space-x-2">
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            <Badge variant="secondary" className="ml-1">
              {loading ? '...' : tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {visibleTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          <MentorCategoryList
            mentorType={tab.value}
            onSelectMentor={handleSelectMentor}
            selectedMentorId={selectedMentorId}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default MentorCategoryTabs;
