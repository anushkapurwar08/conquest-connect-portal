
-- Drop the existing auth_credentials table and recreate it with a simpler structure
DROP TABLE IF EXISTS public.auth_credentials;

-- Create a simpler auth credentials table
CREATE TABLE public.auth_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role user_role NOT NULL,
  startup_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert working credentials with plain text passwords for simplicity
INSERT INTO public.auth_credentials (username, password, role, startup_name) VALUES
('admin', 'admin', 'team', NULL),
('john', 'doe', 'team', NULL),
('jane', 'smith', 'team', NULL),
('techflow_conquest', 'techflow_refcode', 'startup', 'TechFlow Solutions'),
('greenstart_conquest', 'greenstart_refcode', 'startup', 'GreenStart Energy'),
('mentor1', 'mentor123', 'mentor', NULL),
('johnsmith', 'mentor456', 'mentor', NULL);

-- Enable RLS
ALTER TABLE public.auth_credentials ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for auth credentials
CREATE POLICY "Allow read access to auth credentials" ON public.auth_credentials FOR SELECT USING (true);
