
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string;
  created_at: string;
  message_type: 'message' | 'follow_up_call';
  follow_up_date?: string;
  follow_up_time?: string;
}

interface Conversation {
  id: string;
  mentor_id: string;
  startup_id: string;
  created_at: string;
  updated_at: string;
}

export const useChat = (mentorId?: string, startupId?: string) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('useChat: Hook initialized with:', {
    mentorId: mentorId || 'undefined',
    startupId: startupId || 'undefined',
    profile: !!profile
  });

  // Get or create conversation
  const getOrCreateConversation = async () => {
    if (!mentorId || !startupId) {
      console.log('useChat: Missing mentorId or startupId:', { mentorId, startupId });
      return null;
    }

    try {
      console.log('useChat: Attempting to find or create conversation for:', { mentorId, startupId });
      
      // First try to find existing conversation
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('startup_id', startupId)
        .maybeSingle();

      if (existingConversation && !fetchError) {
        console.log('useChat: Found existing conversation:', existingConversation);
        return existingConversation;
      }

      console.log('useChat: No existing conversation found, creating new one');
      
      // If no conversation exists, create one
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          mentor_id: mentorId,
          startup_id: startupId
        })
        .select()
        .single();

      if (createError) {
        console.error('useChat: Error creating conversation:', createError);
        return null;
      }

      console.log('useChat: Created new conversation:', newConversation);
      return newConversation;
    } catch (error) {
      console.error('useChat: Error getting or creating conversation:', error);
      return null;
    }
  };

  // Load messages for the conversation
  const loadMessages = async (conversationId: string) => {
    try {
      console.log('useChat: Loading messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('useChat: Error loading messages:', error);
        return;
      }

      console.log('useChat: Loaded messages:', data?.length || 0, 'messages');

      // Cast the data to ensure message_type matches our interface
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'message' | 'follow_up_call'
      }));

      setMessages(typedMessages);
    } catch (error) {
      console.error('useChat: Error loading messages:', error);
    }
  };

  // Send a message
  const sendMessage = async (content: string, messageType: 'message' | 'follow_up_call' = 'message', followUpDate?: string, followUpTime?: string) => {
    console.log('useChat: Attempting to send message:', { 
      content: content.substring(0, 50) + '...', 
      messageType, 
      conversation: !!conversation, 
      profile: !!profile 
    });
    
    if (!conversation || !profile) {
      console.error('useChat: Missing conversation or profile:', { conversation: !!conversation, profile: !!profile });
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      console.log('useChat: Empty message content, not sending');
      return;
    }

    try {
      console.log('useChat: Inserting message into database...');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_profile_id: profile.id,
          content: content.trim(),
          message_type: messageType,
          follow_up_date: followUpDate,
          follow_up_time: followUpTime
        })
        .select()
        .single();

      if (error) {
        console.error('useChat: Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('useChat: Message sent successfully:', data);

      // Cast the response data to match our Message interface
      const typedMessage: Message = {
        ...data,
        message_type: data.message_type as 'message' | 'follow_up_call'
      };

      // Add the new message to local state
      setMessages(prev => [...prev, typedMessage]);
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('useChat: Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize conversation and load messages
  useEffect(() => {
    const initializeChat = async () => {
      console.log('useChat: Initializing chat with:', { mentorId, startupId, profile: !!profile });
      
      if (!mentorId || !startupId) {
        console.log('useChat: Missing mentorId or startupId, not initializing chat');
        setLoading(false);
        return;
      }

      setLoading(true);
      const conv = await getOrCreateConversation();
      
      if (conv) {
        console.log('useChat: Setting conversation:', conv);
        setConversation(conv);
        await loadMessages(conv.id);
      } else {
        console.error('useChat: Failed to get or create conversation');
      }
      
      setLoading(false);
    };

    initializeChat();
  }, [mentorId, startupId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversation) return;

    console.log('useChat: Setting up real-time subscription for conversation:', conversation.id);

    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          console.log('useChat: Received real-time message:', payload);
          const newMessage = payload.new as any;
          // Only add the message if it's not from the current user to avoid duplicates
          if (newMessage.sender_profile_id !== profile?.id) {
            const typedMessage: Message = {
              ...newMessage,
              message_type: newMessage.message_type as 'message' | 'follow_up_call'
            };
            setMessages(prev => [...prev, typedMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('useChat: Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [conversation, profile?.id]);

  return {
    messages,
    conversation,
    loading,
    sendMessage
  };
};
