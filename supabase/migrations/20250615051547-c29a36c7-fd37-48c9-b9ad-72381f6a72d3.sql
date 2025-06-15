
-- Add sample pod attendees (only startups attend pods)
-- This will also test the trigger that automatically updates current_attendees count

INSERT INTO public.pod_attendees (pod_id, startup_id) VALUES
-- TechFlow Solutions attending multiple pods
(
  (SELECT id FROM pods WHERE name = 'Technical Architecture for Scale' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'TechFlow Solutions' LIMIT 1)
),
(
  (SELECT id FROM pods WHERE name = 'From Idea to Product-Market Fit' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'TechFlow Solutions' LIMIT 1)
),
(
  (SELECT id FROM pods WHERE name = 'Growth Marketing Bootcamp' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'TechFlow Solutions' LIMIT 1)
),
(
  (SELECT id FROM pods WHERE name = 'Leadership Fundamentals Workshop' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'TechFlow Solutions' LIMIT 1)
),

-- GreenStart Energy attending different pods
(
  (SELECT id FROM pods WHERE name = 'Building Sustainable E-commerce' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'GreenStart Energy' LIMIT 1)
),
(
  (SELECT id FROM pods WHERE name = 'Fundraising Masterclass' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'GreenStart Energy' LIMIT 1)
),
(
  (SELECT id FROM pods WHERE name = 'Executive Presence & Communication' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'GreenStart Energy' LIMIT 1)
),
(
  (SELECT id FROM pods WHERE name = 'Design Thinking Workshop' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'GreenStart Energy' LIMIT 1)
),

-- Both startups attending the popular Operations Excellence Workshop
(
  (SELECT id FROM pods WHERE name = 'Operations Excellence Workshop' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'TechFlow Solutions' LIMIT 1)
),
(
  (SELECT id FROM pods WHERE name = 'Operations Excellence Workshop' LIMIT 1),
  (SELECT id FROM startups WHERE startup_name = 'GreenStart Energy' LIMIT 1)
);
