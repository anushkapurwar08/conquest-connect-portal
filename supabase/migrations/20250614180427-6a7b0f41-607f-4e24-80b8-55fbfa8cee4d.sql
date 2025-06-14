
-- First, let's check and update the RLS policies for time_slots table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view available slots" ON public.time_slots;
DROP POLICY IF EXISTS "Mentors can manage own slots" ON public.time_slots;

-- Create updated RLS policies for time_slots
CREATE POLICY "Anyone can view time slots" ON public.time_slots
  FOR SELECT USING (true);

CREATE POLICY "Mentors can insert their own slots" ON public.time_slots
  FOR INSERT WITH CHECK (
    mentor_id IN (
      SELECT m.id FROM public.mentors m 
      JOIN public.profiles p ON m.profile_id = p.id 
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update their own slots" ON public.time_slots
  FOR UPDATE USING (
    mentor_id IN (
      SELECT m.id FROM public.mentors m 
      JOIN public.profiles p ON m.profile_id = p.id 
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Mentors can delete their own slots" ON public.time_slots
  FOR DELETE USING (
    mentor_id IN (
      SELECT m.id FROM public.mentors m 
      JOIN public.profiles p ON m.profile_id = p.id 
      WHERE p.id = auth.uid()
    )
  );

-- Also update the mentors table policies to allow profile creation
DROP POLICY IF EXISTS "Mentors can update own data" ON public.mentors;

CREATE POLICY "Mentors can view all mentors" ON public.mentors
  FOR SELECT USING (true);

CREATE POLICY "Users can create mentor profile" ON public.mentors
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update own data" ON public.mentors
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Update profiles policies to ensure proper access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());
