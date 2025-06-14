
-- Create user types enum
CREATE TYPE user_role AS ENUM ('startup', 'mentor', 'team');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  verified_id TEXT,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  company TEXT,
  expertise TEXT[],
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentors table for additional mentor-specific data
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  specializations TEXT[],
  years_experience INTEGER,
  availability_hours JSONB, -- Store weekly availability
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create startups table for startup-specific data
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  startup_name TEXT NOT NULL,
  industry TEXT,
  stage TEXT,
  funding_amount DECIMAL(15,2),
  team_size INTEGER,
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time slots table
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'weekly', 'daily', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments/calls table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_url TEXT,
  notes TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'cancelled')),
  notes TEXT,
  priority INTEGER DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(startup_id, mentor_id)
);

-- Create session notes table
CREATE TABLE public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_insights TEXT,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create authentication credentials table (for your custom auth system)
CREATE TABLE public.auth_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  startup_name TEXT, -- For startup credentials
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for mentors
CREATE POLICY "Anyone can view mentors" ON public.mentors FOR SELECT USING (true);
CREATE POLICY "Mentors can update own data" ON public.mentors FOR UPDATE USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create RLS policies for startups
CREATE POLICY "Anyone can view startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Startups can update own data" ON public.startups FOR UPDATE USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create RLS policies for time slots
CREATE POLICY "Anyone can view available slots" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "Mentors can manage own slots" ON public.time_slots FOR ALL USING (
  mentor_id IN (SELECT id FROM public.mentors WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Create RLS policies for appointments
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (
  mentor_id IN (SELECT id FROM public.mentors WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR startup_id IN (SELECT id FROM public.startups WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Create RLS policies for waitlist
CREATE POLICY "Users can view own waitlist" ON public.waitlist FOR SELECT USING (
  mentor_id IN (SELECT id FROM public.mentors WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR startup_id IN (SELECT id FROM public.startups WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Create RLS policies for session notes
CREATE POLICY "Users can view related session notes" ON public.session_notes FOR SELECT USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE 
    mentor_id IN (SELECT id FROM public.mentors WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    OR startup_id IN (SELECT id FROM public.startups WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  )
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_notes_updated_at BEFORE UPDATE ON public.session_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample auth credentials for testing
INSERT INTO public.auth_credentials (username, password_hash, role, startup_name) VALUES
('techflow_conquest', crypt('techflow_refcode', gen_salt('bf')), 'startup', 'TechFlow'),
('greenstart_conquest', crypt('greenstart_refcode', gen_salt('bf')), 'startup', 'GreenStart'),
('john', crypt('doe', gen_salt('bf')), 'team', NULL),
('jane', crypt('smith', gen_salt('bf')), 'team', NULL),
('admin', crypt('admin', gen_salt('bf')), 'team', NULL),
('mentor1', crypt('mentor123', gen_salt('bf')), 'mentor', NULL),
('johnsmith', crypt('mentor456', gen_salt('bf')), 'mentor', NULL);
