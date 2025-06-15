
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  message_type: string;
  follow_up_date?: string;
  follow_up_time?: string;
}

interface SimpleChatFollowUpProps {
  conversationId?: string;
  otherProfileId?: string;
  userRole?: string;
  mentorId?: string;
  startupId?: string;
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
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

  console.log('SimpleChatFollowUp: Initializing with props:', { 
    conversationId,
    otherProfileId,
    userRole,
    mentorId,
    startupId,
    profile: !!profile 
  });

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages();
    } else if (mentorId && startupId) {
      findOrCreateConversation();
    }
  }, [currentConversationId, mentorId, startupId, profile?.id]);

  const findOrCreateConversation = async () => {
    if (!mentorId || !startupId || !profile?.id) return;

    try {
      setLoading(true);
      console.log('SimpleChatFollowUp: Finding or creating conversation');

      // Try to find existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('mentor_id', mentorId)
        .eq('startup_id', startupId)
        .maybeSingle();

      if (existingConv) {
        console.log('SimpleChatFollowUp: Found existing conversation:', existingConv.id);
        setCurrentConversationId(existingConv.id);
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            mentor_id: mentorId,
            startup_id: startupId
          })
          .select('id')
          .single();

        if (newConv) {
          console.log('SimpleChatFollowUp: Created new conversation:', newConv.id);
          setCurrentConversationId(newConv.id);
        }
      }
    } catch (error) {
      console.error('Error finding/creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to initialize conversation.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!currentConversationId) return;

    try {
      setLoading(true);
      console.log('SimpleChatFollowUp: Fetching messages for conversation:', currentConversationId);

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_profile_id, receiver_profile_id, message_type, follow_up_date, follow_up_time')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages.",
          variant: "destructive"
        });
        return;
      }

      console.log('SimpleChatFollowUp: Fetched messages:', messagesData);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Unexpected error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'message', followUpDate?: string, followUpTime?: string) => {
    if (!currentConversationId || !profile?.id) {
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Determine receiver_profile_id based on current user
      let receiverProfileId = otherProfileId;
      
      if (!receiverProfileId) {
        // If we don't have otherProfileId, determine it from the conversation
        const { data: conversation } = await supabase
          .from('conversations')
          .select('mentor_id, startup_id')
          .eq('id', currentConversationId)
          .single();

        if (conversation) {
          // If current user is the mentor, receiver is startup; if startup, receiver is mentor
          receiverProfileId = conversation.mentor_id === profile.id ? conversation.startup_id : conversation.mentor_id;
        }
      }

      const messageData = {
        conversation_id: currentConversationId,
        sender_profile_id: profile.id,
        receiver_profile_id: receiverProfileId,
        content,
        message_type: messageType,
        follow_up_date: followUpDate || null,
        follow_up_time: followUpTime || null
      };

      console.log('SimpleChatFollowUp: Sending message:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('id, content, created_at, sender_profile_id, receiver_profile_id, message_type, follow_up_date, follow_up_time')
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

      console.log('SimpleChatFollowUp: Message sent successfully:', data);
      
      // Add the new message to the local state
      setMessages(prev => [...prev, data]);
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    console.log('SimpleChatFollowUp: Attempting to send message:', {
      messageLength: newMessage.trim().length,
      conversationId: currentConversationId
    });

    if (!newMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleScheduleFollowUp = async () => {
    console.log('SimpleChatFollowUp: Attempting to schedule follow-up:', {
      followUpDate,
      followUpTime,
      conversationId: currentConversationId
    });

    if (!followUpDate || !followUpTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for follow-up call.",
        variant: "destructive"
      });
      return;
    }

    const content = `Follow-up call scheduled for ${followUpDate} at ${followUpTime}`;
    await sendMessage(content, 'follow_up_call', followUpDate, followUpTime);
    
    setFollowUpDate('');
    setFollowUpTime('');
    
    toast({
      title: "Follow-up Scheduled",
      description: "Follow-up call has been scheduled successfully.",
    });
  };

  // Show error if we don't have the required information
  if (!currentConversationId && !mentorId && !startupId) {
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
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>Conversation ID: {currentConversationId || 'missing'}</p>
              <p>Mentor ID: {mentorId || 'missing'}</p>
              <p>Startup ID: {startupId || 'missing'}</p>
              <p>Current Profile ID: {profile?.id || 'missing'}</p>
            </div>
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
