
-- Create pods table for learning pods functionality
CREATE TABLE public.pods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  current_attendees INTEGER NOT NULL DEFAULT 0,
  mentor_id UUID REFERENCES public.mentors(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pod_attendees table to track who joined which pods
CREATE TABLE public.pod_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pod_id, startup_id)
);

-- Enable RLS on pods table
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pod_attendees table
ALTER TABLE public.pod_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for pods (readable by all authenticated users)
CREATE POLICY "Authenticated users can view active pods" 
  ON public.pods 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create policies for pod_attendees
CREATE POLICY "Users can view pod attendees" 
  ON public.pod_attendees 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Startups can join pods" 
  ON public.pod_attendees 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger to update current_attendees count
CREATE OR REPLACE FUNCTION update_pod_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pods 
    SET current_attendees = current_attendees + 1 
    WHERE id = NEW.pod_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pods 
    SET current_attendees = current_attendees - 1 
    WHERE id = OLD.pod_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pod_attendee_count_trigger
  AFTER INSERT OR DELETE ON public.pod_attendees
  FOR EACH ROW EXECUTE FUNCTION update_pod_attendee_count();
