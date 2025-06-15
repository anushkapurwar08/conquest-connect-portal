
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Calendar, Clock, User, ArrowLeft } from 'lucide-react';
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

interface UserProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  startup_name?: string;
}

interface DirectChatProps {
  otherUser: UserProfile;
  onBack?: () => void;
}

const DirectChat: React.FC<DirectChatProps> = ({ otherUser, onBack }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('DirectChat: Initializing chat with:', {
    currentUser: profile?.id,
    otherUser: otherUser.id,
    otherUserName: otherUser.username
  });

  useEffect(() => {
    if (profile?.id && otherUser.id) {
      fetchMessages();
      
      // Setup realtime subscription with proper cleanup
      const channel = supabase
        .channel(`direct_chat_${profile.id}_${otherUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const newMessage = payload.new as Message;
            // Only add messages that are part of this conversation
            if (
              (newMessage.sender_profile_id === profile.id && newMessage.receiver_profile_id === otherUser.id) ||
              (newMessage.sender_profile_id === otherUser.id && newMessage.receiver_profile_id === profile.id)
            ) {
              console.log('DirectChat: New message received in real-time:', newMessage);
              setMessages(prev => [...prev, newMessage]);
            }
          }
        )
        .subscribe();

      // Cleanup function
      return () => {
        console.log('DirectChat: Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id, otherUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      console.log('DirectChat: Fetching messages between users:', {
        currentUser: profile.id,
        otherUser: otherUser.id
      });

      // Fetch all messages between these two users
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_profile_id, receiver_profile_id, message_type, follow_up_date, follow_up_time')
        .or(`and(sender_profile_id.eq.${profile.id},receiver_profile_id.eq.${otherUser.id}),and(sender_profile_id.eq.${otherUser.id},receiver_profile_id.eq.${profile.id})`)
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

      console.log('DirectChat: Fetched messages:', messagesData);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Unexpected error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'message', followUpDate?: string, followUpTime?: string) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const messageData = {
        sender_profile_id: profile.id,
        receiver_profile_id: otherUser.id,
        content,
        message_type: messageType,
        follow_up_date: followUpDate || null,
        follow_up_time: followUpTime || null
      };

      console.log('DirectChat: Sending message:', messageData);

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

      console.log('DirectChat: Message sent successfully:', data);
      
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

  const getDisplayName = () => {
    if (otherUser.first_name && otherUser.last_name) {
      return `${otherUser.first_name} ${otherUser.last_name}`;
    }
    return otherUser.username;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        )}
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <div>
            <h3 className="font-medium">{getDisplayName()}</h3>
            <p className="text-sm text-muted-foreground">
              {otherUser.role} • @{otherUser.username}
              {otherUser.startup_name && ` • ${otherUser.startup_name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Chat with {getDisplayName()}</span>
          </CardTitle>
          <CardDescription>
            Direct messaging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
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
                })}
                <div ref={messagesEndRef} />
              </>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
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

export default DirectChat;
