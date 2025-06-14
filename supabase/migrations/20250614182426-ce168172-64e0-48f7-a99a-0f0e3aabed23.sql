
-- Create conversations table to group related messages
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, startup_id)
);

-- Create messages table to store chat messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'message' CHECK (message_type IN ('message', 'follow_up_call')),
  follow_up_date DATE,
  follow_up_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Allow all operations on conversations" ON public.conversations
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for messages
CREATE POLICY "Allow all operations on messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

-- Add trigger for updated_at on conversations
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON public.conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_conversations_mentor_startup ON public.conversations(mentor_id, startup_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
