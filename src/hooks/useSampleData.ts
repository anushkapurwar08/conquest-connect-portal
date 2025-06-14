
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type MentorType = Database['public']['Enums']['mentor_type'];

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

      // Create diverse sample profiles with detailed characterization
      const sampleProfiles = [
        {
          username: 'sarah_techcorp',
          first_name: 'Sarah',
          last_name: 'Johnson',
          role: 'mentor' as UserRole,
          title: 'Former CEO at TechCorp',
          company: 'TechCorp (Acquired by Microsoft)',
          expertise: ['Product Strategy', 'Go-to-Market', 'Fundraising', 'Team Building', 'B2B Sales'],
          bio: 'Serial entrepreneur with 3 successful exits totaling $500M+ in value. Built TechCorp from idea to $100M revenue before acquisition by Microsoft. Expert in product-market fit, scaling teams, and venture fundraising. Passionate about helping early-stage B2B startups navigate growth challenges.'
        },
        {
          username: 'michael_scalex',
          first_name: 'Michael',
          last_name: 'Chen',
          role: 'mentor' as UserRole,
          title: 'CTO & Co-founder at ScaleX',
          company: 'ScaleX Technologies',
          expertise: ['Technical Architecture', 'Engineering Leadership', 'DevOps', 'AI/ML', 'Product Development'],
          bio: 'Former Principal Engineer at Google, now CTO of ScaleX (YC S19). Led engineering teams of 50+ developers. Expert in building scalable systems, technical hiring, and engineering culture. Specializes in helping technical founders transition from individual contributors to engineering leaders.'
        },
        {
          username: 'emily_leadership',
          first_name: 'Emily',
          last_name: 'Rodriguez',
          role: 'mentor' as UserRole,
          title: 'Executive Coach & Former VP at Salesforce',
          company: 'Leadership Dynamics Consulting',
          expertise: ['Executive Leadership', 'Communication', 'Team Dynamics', 'Performance Management', 'Change Management'],
          bio: 'Former VP of Sales at Salesforce with 15+ years of executive experience. Certified executive coach (ICF) specializing in founder development and high-performance team building. Helped 100+ startup leaders overcome scaling challenges and develop authentic leadership styles.'
        },
        {
          username: 'david_ventures',
          first_name: 'David',
          last_name: 'Kim',
          role: 'mentor' as UserRole,
          title: 'Partner at Growth Ventures',
          company: 'Growth Ventures',
          expertise: ['Venture Capital', 'Due Diligence', 'Market Analysis', 'Portfolio Management', 'Exit Strategy'],
          bio: 'Partner at Growth Ventures with $500M+ AUM. Led investments in 40+ startups including 3 unicorns. Former startup founder (acquired by LinkedIn). Deep expertise in B2B SaaS, fintech, and marketplace businesses. Helps founders prepare for fundraising and strategic exits.'
        },
        {
          username: 'lisa_design',
          first_name: 'Lisa',
          last_name: 'Thompson',
          role: 'mentor' as UserRole,
          title: 'Head of Design at Uber',
          company: 'Uber Technologies',
          expertise: ['Product Design', 'User Experience', 'Design Systems', 'User Research', 'Brand Strategy'],
          bio: 'Head of Design at Uber, previously at Airbnb and Apple. 12+ years designing products used by millions. Expert in user-centered design, design systems, and building design teams. Passionate about helping startups create intuitive, scalable user experiences that drive growth.'
        },
        {
          username: 'james_marketing',
          first_name: 'James',
          last_name: 'Wilson',
          role: 'mentor' as UserRole,
          title: 'Former CMO at HubSpot',
          company: 'Growth Marketing Advisors',
          expertise: ['Growth Marketing', 'Content Strategy', 'SEO/SEM', 'Marketing Analytics', 'Brand Building'],
          bio: 'Former CMO at HubSpot during hypergrowth phase (50M to 500M ARR). Expert in growth marketing, content strategies, and building marketing organizations. Helped 50+ B2B startups achieve product-market fit and scale customer acquisition efficiently.'
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

      // Create mentor records with proper categorization and pricing
      const mentorRecords = [
        {
          profile_id: profiles[0].id, // Sarah - Founder Mentor
          mentor_type: 'founder_mentor' as MentorType,
          years_experience: 15,
          hourly_rate: 500,
          specializations: ['B2B SaaS', 'Enterprise Sales', 'Series A-C Fundraising']
        },
        {
          profile_id: profiles[1].id, // Michael - Expert
          mentor_type: 'expert' as MentorType,
          years_experience: 12,
          hourly_rate: 350,
          specializations: ['Backend Systems', 'Cloud Architecture', 'Technical Team Scaling']
        },
        {
          profile_id: profiles[2].id, // Emily - Coach
          mentor_type: 'coach' as MentorType,
          years_experience: 18,
          hourly_rate: 400,
          specializations: ['Leadership Development', 'Executive Presence', 'Difficult Conversations']
        },
        {
          profile_id: profiles[3].id, // David - Expert
          mentor_type: 'expert' as MentorType,
          years_experience: 20,
          hourly_rate: 600,
          specializations: ['Venture Capital', 'Financial Modeling', 'Strategic Partnerships']
        },
        {
          profile_id: profiles[4].id, // Lisa - Expert
          mentor_type: 'expert' as MentorType,
          years_experience: 12,
          hourly_rate: 300,
          specializations: ['Product Design', 'User Research', 'Design Leadership']
        },
        {
          profile_id: profiles[5].id, // James - Expert
          mentor_type: 'expert' as MentorType,
          years_experience: 14,
          hourly_rate: 350,
          specializations: ['Growth Marketing', 'Content Marketing', 'Marketing Operations']
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
