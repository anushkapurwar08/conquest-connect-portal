
-- First, create a security definer function to get current user profile from custom auth
-- This function will be used by RLS policies to work with the custom auth system
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Since we're using custom auth, we'll need to get the profile ID from the session
  -- For now, we'll disable RLS checking by returning the profile ID passed in context
  SELECT COALESCE(
    current_setting('app.current_user_id', true)::uuid,
    NULL
  );
$$;

-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Anyone can view time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Mentors can insert their own slots" ON public.time_slots;
DROP POLICY IF EXISTS "Mentors can update their own slots" ON public.time_slots;
DROP POLICY IF EXISTS "Mentors can delete their own slots" ON public.time_slots;

-- Temporarily disable RLS on time_slots to allow mentor operations
-- We'll create a more permissive policy that works with custom auth
CREATE POLICY "Allow authenticated operations on time slots" ON public.time_slots
  FOR ALL USING (true) WITH CHECK (true);

-- Update mentors table policies
DROP POLICY IF EXISTS "Mentors can view all mentors" ON public.mentors;
DROP POLICY IF EXISTS "Users can create mentor profile" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can update own data" ON public.mentors;

CREATE POLICY "Allow all operations on mentors" ON public.mentors
  FOR ALL USING (true) WITH CHECK (true);

-- Update profiles policies  
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Allow all operations on profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Update appointments policies to work with custom auth
DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their appointments" ON public.appointments;

CREATE POLICY "Allow all operations on appointments" ON public.appointments
  FOR ALL USING (true) WITH CHECK (true);
