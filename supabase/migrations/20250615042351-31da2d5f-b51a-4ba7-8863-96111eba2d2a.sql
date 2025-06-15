
-- Add receiver_profile_id column to messages table
ALTER TABLE public.messages 
ADD COLUMN receiver_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index for better performance on receiver queries
CREATE INDEX idx_messages_receiver_profile_id ON public.messages(receiver_profile_id);
