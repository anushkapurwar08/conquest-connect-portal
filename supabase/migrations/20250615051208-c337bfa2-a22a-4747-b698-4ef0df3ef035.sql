
-- Insert sample pods with different mentor types and dates
INSERT INTO public.pods (
  name,
  description,
  location,
  date,
  time,
  capacity,
  current_attendees,
  mentor_id,
  is_active
) VALUES
-- Coach-led pods
(
  'Leadership Fundamentals Workshop',
  'Learn essential leadership skills for startup founders. Cover team building, decision making, and communication strategies.',
  'Downtown Conference Center, Room A',
  '2025-01-20',
  '14:00:00',
  15,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'emily_leadership' LIMIT 1),
  true
),
(
  'Executive Presence & Communication',
  'Develop your executive presence and master difficult conversations. Perfect for scaling startup leaders.',
  'Virtual - Zoom Link Provided',
  '2025-01-25',
  '10:00:00',
  12,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'robert_coaching' LIMIT 1),
  true
),

-- Founder Mentor pods
(
  'From Idea to Product-Market Fit',
  'Interactive session on finding product-market fit, featuring real case studies and hands-on exercises.',
  'Tech Hub Coworking Space',
  '2025-01-22',
  '09:00:00',
  20,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'sarah_techcorp' LIMIT 1),
  true
),
(
  'Fundraising Masterclass',
  'Learn the ins and outs of raising capital from someone who has been through multiple funding rounds.',
  'Startup Incubator Main Hall',
  '2025-01-28',
  '16:00:00',
  25,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'marcus_ventures' LIMIT 1),
  true
),
(
  'Building Sustainable E-commerce',
  'Explore strategies for building purpose-driven e-commerce brands that scale sustainably.',
  'Green Business Center',
  '2025-02-02',
  '13:00:00',
  18,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'jennifer_retail' LIMIT 1),
  true
),

-- Expert-led pods
(
  'Technical Architecture for Scale',
  'Deep dive into building scalable systems, microservices, and handling technical debt.',
  'Engineering Campus, Lab 1',
  '2025-01-24',
  '11:00:00',
  15,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'michael_scalex' LIMIT 1),
  true
),
(
  'Design Thinking Workshop',
  'User-centered design principles and building design systems that scale with your product.',
  'Design Studio Downtown',
  '2025-01-30',
  '14:30:00',
  12,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'lisa_design' LIMIT 1),
  true
),
(
  'Growth Marketing Bootcamp',
  'Learn growth hacking techniques, content marketing strategies, and marketing analytics.',
  'Marketing Hub Conference Room',
  '2025-02-05',
  '10:30:00',
  20,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'james_marketing' LIMIT 1),
  true
),
(
  'Operations Excellence Workshop',
  'Master process optimization, international scaling, and building operational frameworks.',
  'Business Operations Center',
  '2025-02-08',
  '15:00:00',
  16,
  0,
  (SELECT m.id FROM mentors m JOIN profiles p ON m.profile_id = p.id WHERE p.username = 'ana_ops' LIMIT 1),
  true
);
