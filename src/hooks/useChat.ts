
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Message {
  id: string;
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

  // Get or create conversation
  const getOrCreateConversation = async () => {
    if (!mentorId || !startupId) return null;

    try {
      // First try to find existing conversation
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('startup_id', startupId)
        .single();

      if (existingConversation && !fetchError) {
        return existingConversation;
      }

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
        console.error('Error creating conversation:', createError);
        return null;
      }

      return newConversation;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      return null;
    }
  };

  // Load messages for the conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send a message
  const sendMessage = async (content: string, messageType: 'message' | 'follow_up_call' = 'message', followUpDate?: string, followUpTime?: string) => {
    if (!conversation || !profile) {
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_profile_id: profile.id,
          content,
          message_type: messageType,
          follow_up_date: followUpDate,
          follow_up_time: followUpTime
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Add the new message to local state
      setMessages(prev => [...prev, data]);
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
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
      if (!mentorId || !startupId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const conv = await getOrCreateConversation();
      
      if (conv) {
        setConversation(conv);
        await loadMessages(conv.id);
      }
      
      setLoading(false);
    };

    initializeChat();
  }, [mentorId, startupId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversation) return;

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
          const newMessage = payload.new as Message;
          // Only add the message if it's not from the current user to avoid duplicates
          if (newMessage.sender_profile_id !== profile?.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
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
