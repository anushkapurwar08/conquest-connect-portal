
-- Add coach_startup_assignments table to track 2 startup limit per coach
CREATE TABLE public.coach_startup_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coach_id, startup_id)
);

-- Add booking_windows table for configurable time windows
CREATE TABLE public.booking_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add mentor_toggles table for admin controls
CREATE TABLE public.mentor_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_type mentor_type NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  UNIQUE(mentor_type)
);

-- Add notification_settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  booking_confirmations BOOLEAN DEFAULT TRUE,
  slot_reminders BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Update scheduling_rules with advance booking rules
ALTER TABLE public.scheduling_rules 
ADD COLUMN advance_booking_weeks INTEGER DEFAULT 1,
ADD COLUMN slot_creation_window_weeks INTEGER DEFAULT 1;

-- Insert default booking window (will be configurable)
INSERT INTO public.booking_windows (name, day_of_week, start_time, end_time) 
VALUES ('Default Booking Window', 0, '12:00:00', '23:00:00');

-- Insert mentor toggles with default values
INSERT INTO public.mentor_toggles (mentor_type, is_visible) VALUES
('founder_mentor', TRUE),
('expert', TRUE),
('coach', TRUE);

-- Update scheduling rules with specific advance booking rules
UPDATE public.scheduling_rules SET 
  advance_booking_weeks = 1,
  slot_creation_window_weeks = 1
WHERE mentor_type = 'coach';

UPDATE public.scheduling_rules SET 
  advance_booking_weeks = 2,
  slot_creation_window_weeks = 2
WHERE mentor_type = 'founder_mentor';

UPDATE public.scheduling_rules SET 
  advance_booking_weeks = 4,
  slot_creation_window_weeks = 4
WHERE mentor_type = 'expert';

-- Add constraint to ensure coaches can only have 2 startup assignments
CREATE OR REPLACE FUNCTION check_coach_assignment_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for coaches
  IF EXISTS (
    SELECT 1 FROM public.mentors m 
    WHERE m.id = NEW.coach_id AND m.mentor_type = 'coach'
  ) THEN
    -- Check if coach already has 2 active assignments
    IF (
      SELECT COUNT(*) 
      FROM public.coach_startup_assignments 
      WHERE coach_id = NEW.coach_id AND is_active = TRUE
    ) >= 2 THEN
      RAISE EXCEPTION 'Coaches can only be assigned to a maximum of 2 startups';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_coach_assignment_limit
  BEFORE INSERT ON public.coach_startup_assignments
  FOR EACH ROW
  EXECUTE FUNCTION check_coach_assignment_limit();

-- Enable RLS on new tables
ALTER TABLE public.coach_startup_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on coach assignments" ON public.coach_startup_assignments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on booking windows" ON public.booking_windows
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on mentor toggles" ON public.mentor_toggles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notification settings" ON public.notification_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_coach_startup_assignments_coach ON public.coach_startup_assignments(coach_id);
CREATE INDEX idx_coach_startup_assignments_startup ON public.coach_startup_assignments(startup_id);
CREATE INDEX idx_booking_windows_active ON public.booking_windows(is_active);
CREATE INDEX idx_mentor_toggles_type ON public.mentor_toggles(mentor_type);
CREATE INDEX idx_notification_settings_profile ON public.notification_settings(profile_id);
