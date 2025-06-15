
-- First, let's create the assignments table structure
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id), -- Who made the assignment
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, startup_id) -- Prevent duplicate assignments
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for assignments
CREATE POLICY "Users can view assignments they're involved in" 
ON public.assignments FOR SELECT USING (
  mentor_id IN (SELECT id FROM public.mentors WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR startup_id IN (SELECT id FROM public.startups WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Team members can manage assignments" 
ON public.assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'team')
);

-- Add sample assignments using the first available mentors of each type
INSERT INTO public.assignments (mentor_id, startup_id, notes) VALUES
-- TechFlow Solutions assignments
(
  (SELECT m.id FROM public.mentors m WHERE m.mentor_type = 'founder_mentor' LIMIT 1),
  (SELECT id FROM public.startups WHERE startup_name = 'TechFlow Solutions' LIMIT 1),
  'Assigned for technical scaling guidance'
),
(
  (SELECT m.id FROM public.mentors m WHERE m.mentor_type = 'coach' LIMIT 1),
  (SELECT id FROM public.startups WHERE startup_name = 'TechFlow Solutions' LIMIT 1),
  'Weekly coaching sessions for leadership development'
),

-- GreenStart Energy assignments
(
  (SELECT m.id FROM public.mentors m WHERE m.mentor_type = 'founder_mentor' ORDER BY created_at DESC LIMIT 1 OFFSET 1),
  (SELECT id FROM public.startups WHERE startup_name = 'GreenStart Energy' LIMIT 1),
  'Sustainable business model development'
),
(
  (SELECT m.id FROM public.mentors m WHERE m.mentor_type = 'coach' ORDER BY created_at DESC LIMIT 1 OFFSET 1),
  (SELECT id FROM public.startups WHERE startup_name = 'GreenStart Energy' LIMIT 1),
  'Strategic planning and execution coaching'
);
