
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp } from 'lucide-react';
import MentorCategoryList from './MentorCategoryList';
import MentorProfile from './MentorProfile';

interface MentorCategoryTabsProps {
  onSelectMentor: (mentorId: string, mentorType: 'founder_mentor' | 'expert' | 'coach') => void;
  selectedMentorId?: string;
}

const MentorCategoryTabs: React.FC<MentorCategoryTabsProps> = ({ 
  onSelectMentor, 
  selectedMentorId 
}) => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'founder_mentor' | 'expert' | 'coach'>('founder_mentor');

  const handleSelectMentor = (mentorId: string) => {
    onSelectMentor(mentorId, activeTab);
  };

  const handleOpenProfile = (mentorId: string) => {
    setSelectedProfile(mentorId);
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
  };

  if (selectedProfile) {
    return (
      <MentorProfile
        mentorId={selectedProfile}
        onClose={handleCloseProfile}
      />
    );
  }

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
          <Badge variant="secondary" className="ml-1">3</Badge>
        </TabsTrigger>
        <TabsTrigger value="expert" className="flex items-center space-x-2">
          <Target className="h-4 w-4" />
          <span>Experts</span>
          <Badge variant="secondary" className="ml-1">8</Badge>
        </TabsTrigger>
        <TabsTrigger value="coach" className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>Coaches</span>
          <Badge variant="secondary" className="ml-1">5</Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="founder_mentor" className="mt-6">
        <MentorCategoryList
          mentorType="founder_mentor"
          onSelectMentor={handleSelectMentor}
          onOpenProfile={handleOpenProfile}
          selectedMentorId={selectedMentorId}
        />
      </TabsContent>
      
      <TabsContent value="expert" className="mt-6">
        <MentorCategoryList
          mentorType="expert"
          onSelectMentor={handleSelectMentor}
          onOpenProfile={handleOpenProfile}
          selectedMentorId={selectedMentorId}
        />
      </TabsContent>
      
      <TabsContent value="coach" className="mt-6">
        <MentorCategoryList
          mentorType="coach"
          onSelectMentor={handleSelectMentor}
          onOpenProfile={handleOpenProfile}
          selectedMentorId={selectedMentorId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MentorCategoryTabs;
