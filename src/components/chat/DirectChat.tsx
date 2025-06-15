
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  created_at: string;
}

interface DirectChatProps {
  otherUserId: string;
  otherUserName: string;
  onBack?: () => void;
}

const DirectChat: React.FC<DirectChatProps> = ({ otherUserId, otherUserName, onBack }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (profile?.id && otherUserId) {
      fetchMessages();
      setupRealtimeSubscription();
    }

    return () => {
      cleanupSubscription();
    };
  }, [profile?.id, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const setupRealtimeSubscription = () => {
    if (!profile?.id || !otherUserId) return;

    // Clean up any existing subscription first
    cleanupSubscription();

    console.log('Setting up realtime subscription for messages between:', profile.id, 'and', otherUserId);

    const channelName = `direct-chat-${[profile.id, otherUserId].sort().join('-')}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received via realtime:', payload);
          const newMsg = payload.new as Message;
          
          // Only add message if it's part of this conversation
          if ((newMsg.sender_profile_id === profile.id && newMsg.receiver_profile_id === otherUserId) ||
              (newMsg.sender_profile_id === otherUserId && newMsg.receiver_profile_id === profile.id)) {
            setMessages(current => {
              // Avoid duplicates
              if (current.find(msg => msg.id === newMsg.id)) {
                return current;
              }
              return [...current, newMsg];
            });
          }
        }
      )
      .subscribe();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!profile?.id || !otherUserId) return;

    try {
      console.log('Fetching messages between:', profile.id, 'and', otherUserId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_profile_id.eq.${profile.id},receiver_profile_id.eq.${otherUserId}),and(sender_profile_id.eq.${otherUserId},receiver_profile_id.eq.${profile.id})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading messages.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profile?.id || !otherUserId || sending) {
      return;
    }

    setSending(true);
    console.log('Sending message from:', profile.id, 'to:', otherUserId, 'content:', newMessage.trim());

    try {
      const messageData = {
        sender_profile_id: profile.id,
        receiver_profile_id: otherUserId,
        content: newMessage.trim(),
        message_type: 'message'
      };

      console.log('Message data being sent:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        
        // More specific error handling
        if (error.code === '23503') {
          if (error.message.includes('sender_profile_id')) {
            toast({
              title: "Error",
              description: "Your profile was not found. Please refresh and try again.",
              variant: "destructive"
            });
          } else if (error.message.includes('receiver_profile_id')) {
            toast({
              title: "Error",
              description: "Recipient profile not found. Please refresh and try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Error",
              description: "Profile validation failed. Please refresh and try again.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Error",
            description: `Failed to send message: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      console.log('Message sent successfully:', data);
      setNewMessage('');
      
      // Add the message optimistically to the UI
      if (data) {
        setMessages(current => [...current, data as Message]);
      }
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the message.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !sending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading chat...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat with {otherUserName}</span>
            </CardTitle>
            <CardDescription>Direct messaging</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender_profile_id === profile?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-3 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-orange-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            rows={2}
            disabled={sending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || sending}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectChat;
