
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SimpleChatFollowUpProps {
  conversationId?: string;
  otherProfileId?: string;
  userRole?: string;
  mentorId?: string;
  startupId?: string;
}

interface Message {
  id: string;
  content: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  message_type: string;
  follow_up_date?: string;
  follow_up_time?: string;
  created_at: string;
}

const SimpleChatFollowUp: React.FC<SimpleChatFollowUpProps> = ({ 
  conversationId,
  otherProfileId,
  userRole,
  mentorId,
  startupId
}) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [loading, setLoading] = useState(true);

  console.log('SimpleChatFollowUp: Initializing with props:', { 
    conversationId,
    otherProfileId,
    userRole,
    mentorId,
    startupId,
    profile: !!profile 
  });

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
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
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    console.log('Subscribing to messages for conversation:', conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from messages');
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    console.log('SimpleChatFollowUp: Attempting to send message:', {
      messageLength: newMessage.trim().length,
      conversationId,
      otherProfileId
    });

    if (!newMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }

    if (!conversationId || !profile?.id) {
      console.error('SimpleChatFollowUp: Cannot send message - missing required IDs');
      toast({
        title: "Missing Information",
        description: "Conversation information is required to send messages.",
        variant: "destructive"
      });
      return;
    }

    try {
      const messageData = {
        conversation_id: conversationId,
        sender_profile_id: profile.id,
        receiver_profile_id: otherProfileId,
        content: newMessage.trim(),
        message_type: 'message'
      };

      console.log('Sending message with data:', messageData);

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the message.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleFollowUp = async () => {
    console.log('SimpleChatFollowUp: Attempting to schedule follow-up:', {
      followUpDate,
      followUpTime,
      conversationId
    });

    if (!followUpDate || !followUpTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for follow-up call.",
        variant: "destructive"
      });
      return;
    }

    if (!conversationId || !profile?.id) {
      toast({
        title: "Error",
        description: "Conversation information is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const content = `Follow-up call scheduled for ${followUpDate} at ${followUpTime}`;
      
      const messageData = {
        conversation_id: conversationId,
        sender_profile_id: profile.id,
        receiver_profile_id: otherProfileId,
        content,
        message_type: 'follow_up_call',
        follow_up_date: followUpDate,
        follow_up_time: followUpTime
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) {
        console.error('Error scheduling follow-up:', error);
        toast({
          title: "Error",
          description: "Failed to schedule follow-up. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setFollowUpDate('');
      setFollowUpTime('');
      
      toast({
        title: "Follow-up Scheduled",
        description: "Follow-up call has been scheduled successfully.",
      });
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while scheduling the follow-up.",
        variant: "destructive"
      });
    }
  };

  if (!conversationId || !otherProfileId) {
    console.log('SimpleChatFollowUp: Rendering error state due to missing IDs');
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h3 className="text-lg font-medium mb-2">Setup Required</h3>
            <p className="text-muted-foreground mb-4">
              Missing required information to start chatting.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    console.log('SimpleChatFollowUp: Rendering loading state');
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading chat...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('SimpleChatFollowUp: Rendering chat interface with', messages.length, 'messages');

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Chat</span>
          </CardTitle>
          <CardDescription>
            1-on-1 communication and follow-up scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
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
                      {message.message_type === 'follow_up_call' && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs font-medium">Follow-up Call</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
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
          </div>

          {/* New Message Input */}
          <div className="flex space-x-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button onClick={handleSendMessage} className="bg-orange-500 hover:bg-orange-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Follow-up Call Scheduling */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Schedule Follow-up Call</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleScheduleFollowUp}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleChatFollowUp;
