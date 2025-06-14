
-- First, let's check the current state of mentor-profile linkage
-- and fix any missing connections

-- Update mentors to link with their corresponding profiles based on username matching
UPDATE public.mentors 
SET profile_id = p.id
FROM public.profiles p, public.auth_credentials ac
WHERE mentors.profile_id IS NULL 
  AND p.username = ac.username 
  AND ac.role = 'mentor';

-- Insert sample mentor profiles if they don't exist
INSERT INTO public.profiles (username, role, first_name, last_name, title, company, bio, expertise)
VALUES 
  ('mentor1', 'mentor', 'Sarah', 'Chen', 'Serial Entrepreneur & Startup Advisor', 'TechVentures Inc', 'Former founder of 3 successful startups with 2 exits. Passionate about helping early-stage founders navigate product-market fit and scaling challenges.', ARRAY['Product Strategy', 'Fundraising', 'Team Building']),
  ('johnsmith', 'mentor', 'John', 'Smith', 'AI/ML Expert & Former CTO', 'DataCorp Solutions', 'Former CTO at multiple tech companies with 15+ years building AI-driven products. Expert in machine learning, data architecture, and technical team leadership.', ARRAY['Artificial Intelligence', 'Machine Learning', 'Technical Leadership'])
ON CONFLICT (username) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  bio = EXCLUDED.bio,
  expertise = EXCLUDED.expertise;

-- Create additional mentor profiles for better distribution across categories
INSERT INTO public.profiles (username, role, first_name, last_name, title, company, bio, expertise)
VALUES 
  ('founder_mentor1', 'mentor', 'Michael', 'Rodriguez', 'E-commerce Founder', 'ShopTech Solutions', 'Built and sold two e-commerce platforms. Expert in marketplace dynamics, customer acquisition, and international expansion.', ARRAY['E-commerce', 'Growth Strategy', 'International Markets']),
  ('founder_mentor2', 'mentor', 'Emily', 'Watson', 'SaaS Founder', 'CloudStream Inc', 'Founded successful B2B SaaS company serving 10K+ customers. Specializes in enterprise sales and product development.', ARRAY['SaaS', 'Enterprise Sales', 'Product Development']),
  ('expert1', 'mentor', 'David', 'Kim', 'Fintech Expert', 'Financial Innovations Lab', 'Former VP at major fintech company. Deep expertise in financial regulations, payment systems, and blockchain technology.', ARRAY['Fintech', 'Blockchain', 'Regulatory Compliance']),
  ('expert2', 'mentor', 'Lisa', 'Thompson', 'Healthcare Innovation Expert', 'MedTech Advisors', 'Former head of innovation at healthcare giant. Specialist in digital health, medical devices, and healthcare regulations.', ARRAY['Healthcare', 'Digital Health', 'Medical Devices']),
  ('expert3', 'mentor', 'James', 'Wilson', 'Marketing Strategist', 'GrowthLab Agency', 'Growth marketing expert with proven track record across multiple industries. Specializes in digital marketing and brand strategy.', ARRAY['Digital Marketing', 'Brand Strategy', 'Growth Marketing']),
  ('coach1', 'mentor', 'Amanda', 'Foster', 'Executive Leadership Coach', 'Leadership Excellence Partners', 'Certified executive coach with 20+ years experience. Helps founders develop leadership skills and build high-performing teams.', ARRAY['Leadership Development', 'Team Management', 'Executive Coaching']),
  ('coach2', 'mentor', 'Robert', 'Chang', 'Performance Coach', 'Peak Performance Institute', 'Performance coach specializing in founder wellness, stress management, and sustainable growth practices.', ARRAY['Founder Wellness', 'Performance Optimization', 'Stress Management']),
  ('coach3', 'mentor', 'Maria', 'Garcia', 'Business Strategy Coach', 'Strategic Growth Consultancy', 'Business strategy coach helping startups refine their business models and go-to-market strategies.', ARRAY['Business Strategy', 'Go-to-Market', 'Business Model Design'])
ON CONFLICT (username) DO NOTHING;

-- Create corresponding mentor records
INSERT INTO public.mentors (mentor_type, years_experience, specializations, profile_id)
SELECT 
  CASE 
    WHEN p.username LIKE 'founder_%' THEN 'founder_mentor'::mentor_type
    WHEN p.username LIKE 'expert%' THEN 'expert'::mentor_type  
    WHEN p.username LIKE 'coach%' THEN 'coach'::mentor_type
    WHEN p.username = 'mentor1' THEN 'founder_mentor'::mentor_type
    WHEN p.username = 'johnsmith' THEN 'expert'::mentor_type
    ELSE 'expert'::mentor_type
  END as mentor_type,
  CASE 
    WHEN p.username IN ('founder_mentor1', 'founder_mentor2', 'mentor1') THEN 12
    WHEN p.username IN ('expert1', 'expert2', 'expert3', 'johnsmith') THEN 15
    WHEN p.username IN ('coach1', 'coach2', 'coach3') THEN 20
    ELSE 10
  END as years_experience,
  p.expertise as specializations,
  p.id as profile_id
FROM public.profiles p
WHERE p.role = 'mentor' 
  AND NOT EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.profile_id = p.id
  );

-- Create auth credentials for new mentors
INSERT INTO public.auth_credentials (username, password, role)
VALUES 
  ('founder_mentor1', 'founder123', 'mentor'),
  ('founder_mentor2', 'founder456', 'mentor'),
  ('expert1', 'expert123', 'mentor'),
  ('expert2', 'expert456', 'mentor'), 
  ('expert3', 'expert789', 'mentor'),
  ('coach1', 'coach123', 'mentor'),
  ('coach2', 'coach456', 'mentor'),
  ('coach3', 'coach789', 'mentor')
ON CONFLICT (username) DO NOTHING;

-- Final verification: ensure all mentors have profile_id
UPDATE public.mentors 
SET profile_id = p.id
FROM public.profiles p
WHERE mentors.profile_id IS NULL 
  AND EXISTS (
    SELECT 1 FROM public.auth_credentials ac 
    WHERE ac.username = p.username AND ac.role = 'mentor'
  );
