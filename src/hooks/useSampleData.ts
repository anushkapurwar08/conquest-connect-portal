
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

      // Create diverse sample profiles for each mentor type
      const sampleProfiles = [
        // Founder Mentors
        {
          username: 'sarah_techcorp',
          first_name: 'Sarah',
          last_name: 'Johnson',
          role: 'mentor' as UserRole,
          title: 'Former CEO at TechCorp',
          company: 'TechCorp (Acquired by Microsoft)',
          expertise: ['Product Strategy', 'Go-to-Market', 'Fundraising', 'Team Building', 'B2B Sales'],
          bio: 'Serial entrepreneur with 3 successful exits totaling $500M+ in value. Built TechCorp from idea to $100M revenue before acquisition by Microsoft. Expert in product-market fit, scaling teams, and venture fundraising.'
        },
        {
          username: 'marcus_ventures',
          first_name: 'Marcus',
          last_name: 'Williams',
          role: 'mentor' as UserRole,
          title: 'Co-founder & Former CEO at DataFlow',
          company: 'DataFlow (IPO 2023)',
          expertise: ['SaaS Scaling', 'IPO Process', 'Enterprise Sales', 'International Expansion'],
          bio: 'Led DataFlow from startup to IPO with $2B valuation. 18 years building enterprise software companies. Passionate about helping B2B founders navigate hyper-growth challenges and prepare for public markets.'
        },
        {
          username: 'jennifer_retail',
          first_name: 'Jennifer',
          last_name: 'Chen',
          role: 'mentor' as UserRole,
          title: 'Founder & CEO at EcoRetail',
          company: 'EcoRetail (Sustainable Commerce)',
          expertise: ['E-commerce', 'Supply Chain', 'Sustainability', 'Direct-to-Consumer', 'Brand Building'],
          bio: 'Built EcoRetail into a $150M sustainable retail platform. Expert in e-commerce operations, supply chain optimization, and building purpose-driven brands that resonate with conscious consumers.'
        },
        
        // Expert Mentors
        {
          username: 'michael_scalex',
          first_name: 'Michael',
          last_name: 'Thompson',
          role: 'mentor' as UserRole,
          title: 'CTO & Co-founder at ScaleX',
          company: 'ScaleX Technologies',
          expertise: ['Technical Architecture', 'Engineering Leadership', 'DevOps', 'AI/ML', 'Product Development'],
          bio: 'Former Principal Engineer at Google, now CTO of ScaleX (YC S19). Led engineering teams of 50+ developers. Expert in building scalable systems, technical hiring, and engineering culture.'
        },
        {
          username: 'lisa_design',
          first_name: 'Lisa',
          last_name: 'Rodriguez',
          role: 'mentor' as UserRole,
          title: 'Head of Design at Uber',
          company: 'Uber Technologies',
          expertise: ['Product Design', 'User Experience', 'Design Systems', 'User Research', 'Brand Strategy'],
          bio: 'Head of Design at Uber, previously at Airbnb and Apple. 12+ years designing products used by millions. Expert in user-centered design, design systems, and building design teams.'
        },
        {
          username: 'james_marketing',
          first_name: 'James',
          last_name: 'Wilson',
          role: 'mentor' as UserRole,
          title: 'Former CMO at HubSpot',
          company: 'Growth Marketing Advisors',
          expertise: ['Growth Marketing', 'Content Strategy', 'SEO/SEM', 'Marketing Analytics', 'Brand Building'],
          bio: 'Former CMO at HubSpot during hypergrowth phase (50M to 500M ARR). Expert in growth marketing, content strategies, and building marketing organizations.'
        },
        {
          username: 'david_fintech',
          first_name: 'David',
          last_name: 'Kim',
          role: 'mentor' as UserRole,
          title: 'Partner at Growth Ventures',
          company: 'Growth Ventures',
          expertise: ['Venture Capital', 'Due Diligence', 'Market Analysis', 'Portfolio Management', 'Exit Strategy'],
          bio: 'Partner at Growth Ventures with $500M+ AUM. Led investments in 40+ startups including 3 unicorns. Former startup founder (acquired by LinkedIn). Deep expertise in B2B SaaS, fintech, and marketplace businesses.'
        },
        {
          username: 'ana_ops',
          first_name: 'Ana',
          last_name: 'Martinez',
          role: 'mentor' as UserRole,
          title: 'VP of Operations at Stripe',
          company: 'Stripe',
          expertise: ['Operations Excellence', 'Process Optimization', 'International Scaling', 'Team Operations'],
          bio: 'VP of Operations at Stripe, scaled operations across 40+ countries. Expert in building operational frameworks, process optimization, and scaling teams internationally.'
        },

        // Executive Coaches
        {
          username: 'emily_leadership',
          first_name: 'Emily',
          last_name: 'Davis',
          role: 'mentor' as UserRole,
          title: 'Executive Coach & Former VP at Salesforce',
          company: 'Leadership Dynamics Consulting',
          expertise: ['Executive Leadership', 'Communication', 'Team Dynamics', 'Performance Management', 'Change Management'],
          bio: 'Former VP of Sales at Salesforce with 15+ years of executive experience. Certified executive coach (ICF) specializing in founder development and high-performance team building.'
        },
        {
          username: 'robert_coaching',
          first_name: 'Robert',
          last_name: 'Taylor',
          role: 'mentor' as UserRole,
          title: 'Leadership Coach & Former McKinsey Partner',
          company: 'Executive Excellence Partners',
          expertise: ['Strategic Thinking', 'Decision Making', 'Board Relations', 'Crisis Leadership', 'Organizational Design'],
          bio: 'Former McKinsey Partner with 20+ years in strategy consulting. Certified executive coach helping startup founders develop strategic thinking, board relationships, and crisis leadership skills.'
        },
        {
          username: 'maria_executive',
          first_name: 'Maria',
          last_name: 'Lopez',
          role: 'mentor' as UserRole,
          title: 'Executive Coach & Former Fortune 500 CEO',
          company: 'C-Suite Development Group',
          expertise: ['CEO Development', 'Board Governance', 'Stakeholder Management', 'Public Company Leadership'],
          bio: 'Former CEO of a Fortune 500 company. Certified executive coach (ICF) specializing in CEO development, board governance, and preparing founders for public company leadership responsibilities.'
        },
        {
          username: 'alex_performance',
          first_name: 'Alex',
          last_name: 'Brown',
          role: 'mentor' as UserRole,
          title: 'Performance Coach & Former Airbnb Director',
          company: 'Peak Performance Coaching',
          expertise: ['Performance Optimization', 'Goal Setting', 'Time Management', 'Stress Management', 'Work-Life Balance'],
          bio: 'Former Director at Airbnb, now certified performance coach. Expert in helping high-performing executives optimize their performance, manage stress, and achieve sustainable work-life integration.'
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

      // Create mentor records with proper categorization
      const mentorRecords = [
        // Founder Mentors (first 3 profiles)
        {
          profile_id: profiles[0].id,
          mentor_type: 'founder_mentor' as MentorType,
          years_experience: 15,
          specializations: ['B2B SaaS', 'Enterprise Sales', 'Series A-C Fundraising']
        },
        {
          profile_id: profiles[1].id,
          mentor_type: 'founder_mentor' as MentorType,
          years_experience: 18,
          specializations: ['IPO Preparation', 'Public Markets', 'Enterprise SaaS']
        },
        {
          profile_id: profiles[2].id,
          mentor_type: 'founder_mentor' as MentorType,
          years_experience: 12,
          specializations: ['E-commerce', 'D2C Brands', 'Sustainable Business']
        },
        
        // Expert Mentors (next 5 profiles)
        {
          profile_id: profiles[3].id,
          mentor_type: 'expert' as MentorType,
          years_experience: 12,
          specializations: ['Backend Systems', 'Cloud Architecture', 'Technical Team Scaling']
        },
        {
          profile_id: profiles[4].id,
          mentor_type: 'expert' as MentorType,
          years_experience: 12,
          specializations: ['Product Design', 'User Research', 'Design Leadership']
        },
        {
          profile_id: profiles[5].id,
          mentor_type: 'expert' as MentorType,
          years_experience: 14,
          specializations: ['Growth Marketing', 'Content Marketing', 'Marketing Operations']
        },
        {
          profile_id: profiles[6].id,
          mentor_type: 'expert' as MentorType,
          years_experience: 20,
          specializations: ['Venture Capital', 'Financial Modeling', 'Strategic Partnerships']
        },
        {
          profile_id: profiles[7].id,
          mentor_type: 'expert' as MentorType,
          years_experience: 10,
          specializations: ['Operations Excellence', 'International Scaling', 'Process Optimization']
        },
        
        // Executive Coaches (last 4 profiles)
        {
          profile_id: profiles[8].id,
          mentor_type: 'coach' as MentorType,
          years_experience: 18,
          specializations: ['Leadership Development', 'Executive Presence', 'Difficult Conversations']
        },
        {
          profile_id: profiles[9].id,
          mentor_type: 'coach' as MentorType,
          years_experience: 22,
          specializations: ['Strategic Leadership', 'Board Relations', 'Crisis Management']
        },
        {
          profile_id: profiles[10].id,
          mentor_type: 'coach' as MentorType,
          years_experience: 25,
          specializations: ['CEO Development', 'Public Company Leadership', 'Board Governance']
        },
        {
          profile_id: profiles[11].id,
          mentor_type: 'coach' as MentorType,
          years_experience: 8,
          specializations: ['Performance Optimization', 'Stress Management', 'Executive Wellness']
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
