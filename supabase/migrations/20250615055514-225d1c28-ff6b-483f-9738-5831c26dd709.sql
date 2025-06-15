
-- Clear existing assignments first
DELETE FROM assignments;

-- Get the current data to understand what we're working with
SELECT 
  s.startup_name,
  s.id as startup_id,
  p_startup.username as startup_username
FROM startups s
JOIN profiles p_startup ON s.profile_id = p_startup.id;

SELECT 
  m.id as mentor_id,
  m.mentor_type,
  p_mentor.username as mentor_username,
  p_mentor.first_name,
  p_mentor.last_name
FROM mentors m
JOIN profiles p_mentor ON m.profile_id = p_mentor.id;

-- Insert assignments one by one to avoid duplicates
-- First, assign coaches to startups
WITH coaches AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM mentors WHERE mentor_type = 'coach'
),
startups_list AS (
  SELECT id, startup_name, ROW_NUMBER() OVER (ORDER BY startup_name) as rn
  FROM startups
)
INSERT INTO assignments (startup_id, mentor_id, is_active, assigned_at)
SELECT s.id, c.id, true, now()
FROM startups_list s
JOIN coaches c ON ((s.rn - 1) % (SELECT COUNT(*) FROM coaches)) + 1 = c.rn;

-- Then assign founder_mentors to startups
WITH founder_mentors AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM mentors WHERE mentor_type = 'founder_mentor'
),
startups_list AS (
  SELECT id, startup_name, ROW_NUMBER() OVER (ORDER BY startup_name) as rn
  FROM startups
)
INSERT INTO assignments (startup_id, mentor_id, is_active, assigned_at)
SELECT s.id, fm.id, true, now()
FROM startups_list s
JOIN founder_mentors fm ON ((s.rn - 1) % (SELECT COUNT(*) FROM founder_mentors)) + 1 = fm.rn;

-- Verify the assignments
SELECT 
  s.startup_name,
  m.mentor_type,
  COALESCE(p_mentor.first_name || ' ' || p_mentor.last_name, p_mentor.username) as mentor_name
FROM assignments a
JOIN startups s ON a.startup_id = s.id
JOIN mentors m ON a.mentor_id = m.id
JOIN profiles p_mentor ON m.profile_id = p_mentor.id
WHERE a.is_active = true
ORDER BY s.startup_name, m.mentor_type;
