
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSampleData = () => {
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.role === 'mentor') {
      createSampleMentors();
    }
  }, [profile]);

  const createSampleMentors = async () => {
    try {
      // Check if mentors already exist
      const { data: existingMentors } = await supabase
        .from('mentors')
        .select('id')
        .limit(1);

      if (existingMentors && existingMentors.length > 0) {
        console.log('Sample mentors already exist');
        return;
      }

      console.log('Creating sample mentors...');

      // Create sample profiles first
      const sampleProfiles = [
        {
          username: 'sarah_founder',
          first_name: 'Sarah',
          last_name: 'Johnson',
          role: 'mentor',
          title: 'Former CEO at TechCorp',
          expertise: ['Product Strategy', 'Go-to-Market', 'Fundraising'],
          bio: 'Serial entrepreneur with 3 successful exits. Passionate about helping early-stage startups scale.'
        },
        {
          username: 'michael_expert',
          first_name: 'Michael',
          last_name: 'Chen',
          role: 'mentor',
          title: 'CTO at StartupX',
          expertise: ['Engineering', 'Team Building', 'Architecture'],
          bio: 'Technology leader with 15+ years building scalable systems.'
        },
        {
          username: 'emily_coach',
          first_name: 'Emily',
          last_name: 'Rodriguez',
          role: 'mentor',
          title: 'Executive Coach',
          expertise: ['Leadership', 'Personal Development', 'Communication'],
          bio: 'Certified executive coach helping founders develop leadership skills.'
        }
      ];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .insert(sampleProfiles)
        .select('id, username');

      if (profileError) {
        console.error('Error creating sample profiles:', profileError);
        return;
      }

      // Create mentor records
      const mentorRecords = [
        {
          profile_id: profiles[0].id,
          mentor_type: 'founder_mentor',
          years_experience: 12,
          hourly_rate: 300
        },
        {
          profile_id: profiles[1].id,
          mentor_type: 'expert',
          years_experience: 8,
          hourly_rate: 200
        },
        {
          profile_id: profiles[2].id,
          mentor_type: 'coach',
          years_experience: 10,
          hourly_rate: 250
        }
      ];

      const { error: mentorError } = await supabase
        .from('mentors')
        .insert(mentorRecords);

      if (mentorError) {
        console.error('Error creating sample mentors:', mentorError);
        return;
      }

      console.log('Sample mentors created successfully');
    } catch (error) {
      console.error('Unexpected error creating sample data:', error);
    }
  };
};
