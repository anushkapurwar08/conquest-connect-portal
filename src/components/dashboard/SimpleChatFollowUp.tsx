
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';

interface SimpleChatFollowUpProps {
  userRole: 'startup' | 'mentor';
  mentorId?: string;
  startupId?: string;
}

const SimpleChatFollowUp: React.FC<SimpleChatFollowUpProps> = ({ 
  userRole, 
  mentorId, 
  startupId 
}) => {
  const { profile } = useAuth();
  const { messages, loading, sendMessage } = useChat(mentorId, startupId);
  const [newMessage, setNewMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');

  // Get sender role for each message
  const getMessageSender = (senderProfileId: string): 'startup' | 'mentor' => {
    // For now, we'll determine sender based on current user
    // In a real app, you'd want to fetch the sender's role from the profile
    return senderProfileId === profile?.id ? userRole : (userRole === 'startup' ? 'mentor' : 'startup');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

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

  if (loading) {
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

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Chat with {userRole === 'startup' ? 'Mentor' : 'Startup'}</span>
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
                const senderRole = getMessageSender(message.sender_profile_id);
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
