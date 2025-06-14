
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfileChat } from '@/hooks/useProfileChat';

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
  const { messages, loading, sendMessage } = useProfileChat(conversationId || '');
  const [newMessage, setNewMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');

  console.log('SimpleChatFollowUp: Initializing with props:', { 
    conversationId,
    otherProfileId,
    userRole,
    mentorId,
    startupId,
    profile: !!profile 
  });

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

    // If we have conversationId, use the existing conversation
    if (conversationId && otherProfileId) {
      console.log('SimpleChatFollowUp: Sending message via useProfileChat hook');
      await sendMessage(newMessage);
      setNewMessage('');
      return;
    }

    // If we have mentorId and startupId, create new conversation
    if (mentorId && startupId) {
      console.log('SimpleChatFollowUp: Creating new conversation');
      try {
        // Create or get conversation
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('mentor_id', mentorId)
          .eq('startup_id', startupId)
          .single();

        let convId = existingConv?.id;

        if (!convId) {
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({
              mentor_id: mentorId,
              startup_id: startupId
            })
            .select('id')
            .single();
          
          convId = newConv?.id;
        }

        if (convId) {
          await supabase
            .from('messages')
            .insert({
              conversation_id: convId,
              sender_profile_id: profile?.id,
              content: newMessage,
              message_type: 'message'
            });

          setNewMessage('');
          toast({
            title: "Message Sent",
            description: "Your message has been sent successfully.",
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
      return;
    }

    console.error('SimpleChatFollowUp: Cannot send message - missing required IDs');
    toast({
      title: "Missing Information",
      description: "Conversation information is required to send messages.",
      variant: "destructive"
    });
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
  if (!conversationId && (!mentorId || !startupId)) {
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
              <p>Conversation ID: {conversationId || 'missing'}</p>
              <p>Mentor ID: {mentorId || 'missing'}</p>
              <p>Startup ID: {startupId || 'missing'}</p>
              <p>Current Profile ID: {profile?.id || 'missing'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && conversationId) {
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
