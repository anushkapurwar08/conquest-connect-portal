
-- Insert sample profiles data
INSERT INTO public.profiles (id, username, role, first_name, last_name, title, company, expertise, bio) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'team', 'Admin', 'User', 'Platform Administrator', 'Conquest', ARRAY['Platform Management', 'Operations'], 'Platform administrator managing the Conquest mentorship system.'),
('550e8400-e29b-41d4-a716-446655440002', 'john', 'team', 'John', 'Doe', 'Team Lead', 'Conquest', ARRAY['Project Management', 'Team Leadership'], 'Team lead responsible for platform operations.'),
('550e8400-e29b-41d4-a716-446655440003', 'jane', 'team', 'Jane', 'Smith', 'Operations Manager', 'Conquest', ARRAY['Operations', 'Analytics'], 'Operations manager overseeing platform metrics.'),
('550e8400-e29b-41d4-a716-446655440004', 'johnsmith', 'mentor', 'John', 'Smith', 'Senior Product Manager', 'TechVentures', ARRAY['Product Strategy', 'Go-to-Market', 'Team Building'], 'Experienced product leader with 10+ years helping startups scale from idea to IPO.'),
('550e8400-e29b-41d4-a716-446655440005', 'mentor1', 'mentor', 'Sarah', 'Johnson', 'CEO & Founder', 'InnovateLab', ARRAY['Fundraising', 'Leadership', 'Strategy'], 'Serial entrepreneur and investor with expertise in B2B SaaS and marketplace businesses.'),
('550e8400-e29b-41d4-a716-446655440006', 'techflow_conquest', 'startup', 'Alex', 'Chen', 'CEO', 'TechFlow Solutions', ARRAY['AI/ML', 'Enterprise Software'], 'Building next-generation AI tools for enterprise workflow automation.'),
('550e8400-e29b-41d4-a716-446655440007', 'greenstart_conquest', 'startup', 'Maria', 'Rodriguez', 'Founder', 'GreenStart Energy', ARRAY['Clean Energy', 'Sustainability'], 'Developing innovative solar energy solutions for residential markets.');

-- Insert sample mentors data
INSERT INTO public.mentors (id, profile_id, specializations, years_experience, hourly_rate, availability_hours) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', ARRAY['Product Strategy', 'Go-to-Market', 'Team Building'], 12, 200.00, '{"monday": ["09:00", "17:00"], "tuesday": ["09:00", "17:00"], "wednesday": ["09:00", "17:00"], "thursday": ["09:00", "17:00"], "friday": ["09:00", "15:00"]}'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', ARRAY['Fundraising', 'Leadership', 'Strategy'], 15, 250.00, '{"monday": ["10:00", "16:00"], "wednesday": ["10:00", "16:00"], "friday": ["10:00", "16:00"]}');

-- Insert sample startups data
INSERT INTO public.startups (id, profile_id, startup_name, industry, stage, funding_amount, team_size, description, website_url) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'TechFlow Solutions', 'AI/ML', 'Series A', 2500000.00, 8, 'Building next-generation AI tools for enterprise workflow automation with focus on reducing manual processes.', 'https://techflow.example.com'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'GreenStart Energy', 'Clean Energy', 'Seed', 500000.00, 5, 'Developing innovative solar energy solutions for residential markets with AI-powered optimization.', 'https://greenstart.example.com');

-- Insert sample time slots
INSERT INTO public.time_slots (id, mentor_id, start_time, end_time, is_available, is_recurring, recurrence_pattern) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-12-20 14:00:00+00', '2024-12-20 15:00:00+00', true, false, NULL),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '2024-12-21 10:00:00+00', '2024-12-21 11:00:00+00', true, false, NULL),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '2024-12-22 11:00:00+00', '2024-12-22 12:00:00+00', true, false, NULL),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '2024-12-23 15:00:00+00', '2024-12-23 16:00:00+00', false, false, NULL);

-- Insert sample appointments
INSERT INTO public.appointments (id, mentor_id, startup_id, time_slot_id, title, description, status, meeting_url, scheduled_at, duration_minutes, notes) VALUES
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440004', 'Product Strategy Session', 'Discussing go-to-market strategy and product positioning', 'completed', 'https://meet.google.com/abc-defg-hij', '2024-12-18 15:00:00+00', 60, 'Great session! Covered market analysis and competitive positioning.'),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', NULL, 'Fundraising Strategy', 'Series A preparation and investor deck review', 'scheduled', 'https://meet.google.com/xyz-uvwx-rst', '2024-12-25 11:00:00+00', 60, NULL);

-- Insert sample waitlist entries
INSERT INTO public.waitlist (id, startup_id, mentor_id, status, notes, priority) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'pending', 'Interested in fundraising guidance for Series A', 1),
('aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'contacted', 'Product strategy consultation requested', 2);

-- Insert sample session notes
INSERT INTO public.session_notes (id, appointment_id, author_id, content, is_shared, shared_insights, follow_up_needed, follow_up_actions) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Discussed market positioning and competitive analysis. TechFlow has strong technical advantages but needs to improve messaging for enterprise customers.', true, 'Focus on B2B enterprise segment first, develop case studies', true, '["Create enterprise customer case studies", "Refine value proposition messaging", "Schedule follow-up in 2 weeks"]');

-- Update auth_credentials to match the profile IDs
UPDATE public.auth_credentials SET id = '550e8400-e29b-41d4-a716-446655440001' WHERE username = 'admin';
UPDATE public.auth_credentials SET id = '550e8400-e29b-41d4-a716-446655440002' WHERE username = 'john';
UPDATE public.auth_credentials SET id = '550e8400-e29b-41d4-a716-446655440003' WHERE username = 'jane';
UPDATE public.auth_credentials SET id = '550e8400-e29b-41d4-a716-446655440004' WHERE username = 'johnsmith';
UPDATE public.auth_credentials SET id = '550e8400-e29b-41d4-a716-446655440005' WHERE username = 'mentor1';
UPDATE public.auth_credentials SET id = '550e8400-e29b-41d4-a716-446655440006' WHERE username = 'techflow_conquest';
UPDATE public.auth_credentials SET id = '550e8400-e29b-41d4-a716-446655440007' WHERE username = 'greenstart_conquest';
