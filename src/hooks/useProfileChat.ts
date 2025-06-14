
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

export const useProfileChat = (conversationId: string) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('useProfileChat: Hook initialized with:', {
    conversationId: conversationId || 'undefined',
    profile: !!profile
  });

  // Load messages for the conversation
  const loadMessages = async (convId: string) => {
    try {
      console.log('useProfileChat: Loading messages for conversation:', convId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('useProfileChat: Error loading messages:', error);
        return;
      }

      console.log('useProfileChat: Loaded messages:', data?.length || 0, 'messages');

      // Cast the data to ensure message_type matches our interface
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'message' | 'follow_up_call'
      }));

      setMessages(typedMessages);
    } catch (error) {
      console.error('useProfileChat: Error loading messages:', error);
    }
  };

  // Send a message
  const sendMessage = async (content: string, messageType: 'message' | 'follow_up_call' = 'message', followUpDate?: string, followUpTime?: string) => {
    console.log('useProfileChat: Attempting to send message:', { 
      content: content.substring(0, 50) + '...', 
      messageType, 
      conversationId,
      profile: !!profile 
    });
    
    if (!conversationId || !profile) {
      console.error('useProfileChat: Missing conversationId or profile:', { conversationId, profile: !!profile });
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      console.log('useProfileChat: Empty message content, not sending');
      return;
    }

    try {
      console.log('useProfileChat: Inserting message into database...');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_profile_id: profile.id,
          content: content.trim(),
          message_type: messageType,
          follow_up_date: followUpDate,
          follow_up_time: followUpTime
        })
        .select()
        .single();

      if (error) {
        console.error('useProfileChat: Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('useProfileChat: Message sent successfully:', data);

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
      console.error('useProfileChat: Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize and load messages
  useEffect(() => {
    const initializeChat = async () => {
      console.log('useProfileChat: Initializing chat with:', { conversationId, profile: !!profile });
      
      if (!conversationId) {
        console.log('useProfileChat: Missing conversationId, not initializing chat');
        setLoading(false);
        return;
      }

      setLoading(true);
      await loadMessages(conversationId);
      setLoading(false);
    };

    initializeChat();
  }, [conversationId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('useProfileChat: Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('useProfileChat: Received real-time message:', payload);
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
      console.log('useProfileChat: Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, profile?.id]);

  return {
    messages,
    loading,
    sendMessage
  };
};
