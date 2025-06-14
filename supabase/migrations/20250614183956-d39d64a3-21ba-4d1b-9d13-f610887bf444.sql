
-- Add mentor_type enum to categorize mentors
CREATE TYPE mentor_type AS ENUM ('founder_mentor', 'expert', 'coach');

-- Add mentor_type column to mentors table
ALTER TABLE public.mentors ADD COLUMN mentor_type mentor_type NOT NULL DEFAULT 'expert';

-- Update existing mentors with some sample data
UPDATE public.mentors SET mentor_type = 'founder_mentor' WHERE id IN (SELECT id FROM public.mentors LIMIT 2);
UPDATE public.mentors SET mentor_type = 'coach' WHERE id IN (SELECT id FROM public.mentors WHERE mentor_type != 'founder_mentor' LIMIT 1);

-- Add index for better performance when filtering by mentor type
CREATE INDEX idx_mentors_mentor_type ON public.mentors(mentor_type);

-- Add scheduling_rules table for category-specific rules
CREATE TABLE public.scheduling_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_type mentor_type NOT NULL,
  default_duration_minutes INTEGER DEFAULT 60,
  max_advance_booking_days INTEGER DEFAULT 30,
  min_advance_booking_hours INTEGER DEFAULT 24,
  allow_recurring BOOLEAN DEFAULT false,
  max_sessions_per_week INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default scheduling rules for each mentor type
INSERT INTO public.scheduling_rules (mentor_type, default_duration_minutes, max_advance_booking_days, min_advance_booking_hours, allow_recurring, max_sessions_per_week) VALUES
('founder_mentor', 90, 60, 48, false, 3),
('expert', 60, 30, 24, false, 5),
('coach', 45, 14, 12, true, 7);

-- Enable RLS on scheduling_rules
ALTER TABLE public.scheduling_rules ENABLE ROW LEVEL SECURITY;

-- Create policy for scheduling rules (read-only for all authenticated users)
CREATE POLICY "Allow all authenticated users to read scheduling rules" ON public.scheduling_rules
  FOR SELECT USING (true);
