
-- First, let's see what startups actually exist
SELECT id, startup_name, profile_id FROM public.startups;

-- Then let's see what mentors exist
SELECT id, mentor_type, profile_id FROM public.mentors;

-- Clear existing assignments
DELETE FROM public.assignments;

-- Insert proper assignments using actual startup names instead of profile_ids
INSERT INTO public.assignments (startup_id, mentor_id, is_active, assigned_at) VALUES 
-- TechFlow Solutions gets Coach and Founder Mentor
((SELECT id FROM startups WHERE startup_name = 'TechFlow Solutions'), 
 (SELECT id FROM mentors WHERE mentor_type = 'coach' LIMIT 1), 
 true, now()),
((SELECT id FROM startups WHERE startup_name = 'TechFlow Solutions'), 
 (SELECT id FROM mentors WHERE mentor_type = 'founder_mentor' LIMIT 1), 
 true, now());

-- GreenStart Energy gets different Coach and the other Founder Mentor
INSERT INTO public.assignments (startup_id, mentor_id, is_active, assigned_at) VALUES 
((SELECT id FROM startups WHERE startup_name = 'GreenStart Energy'), 
 (SELECT id FROM mentors WHERE mentor_type = 'coach' ORDER BY created_at DESC LIMIT 1 OFFSET 1), 
 true, now()),
((SELECT id FROM startups WHERE startup_name = 'GreenStart Energy'), 
 (SELECT id FROM mentors WHERE mentor_type = 'founder_mentor' ORDER BY created_at DESC LIMIT 1 OFFSET 1), 
 true, now());

-- Ensure mentor toggles exist for all mentor types and are visible by default
INSERT INTO public.mentor_toggles (mentor_type, is_visible) VALUES 
('coach', true),
('founder_mentor', true),
('expert', true)
ON CONFLICT (mentor_type) DO UPDATE SET is_visible = true;
