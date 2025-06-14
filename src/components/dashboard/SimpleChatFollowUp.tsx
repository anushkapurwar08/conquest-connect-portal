
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SimpleChatFollowUpProps {
  userRole: string;
  mentorId: string;
  startupId: string;
}

const SimpleChatFollowUp: React.FC<SimpleChatFollowUpProps> = ({ 
  userRole,
  mentorId,
  startupId
}) => {
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');

  console.log('SimpleChatFollowUp: Initializing with props:', { 
    userRole,
    mentorId,
    startupId,
    profile: !!profile 
  });

  const handleSendMessage = async () => {
    console.log('SimpleChatFollowUp: Attempting to send message:', {
      messageLength: newMessage.trim().length,
      userRole,
      mentorId,
      startupId
    });

    if (!newMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }

    if (!mentorId || !startupId) {
      console.error('SimpleChatFollowUp: Cannot send message - missing required IDs');
      toast({
        title: "Missing Information",
        description: "Mentor and startup information is required to send messages.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement actual message sending logic
    console.log('SimpleChatFollowUp: Would send message:', newMessage);
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });
    setNewMessage('');
  };

  const handleScheduleFollowUp = async () => {
    console.log('SimpleChatFollowUp: Attempting to schedule follow-up:', {
      followUpDate,
      followUpTime,
      mentorId,
      startupId
    });

    if (!followUpDate || !followUpTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for follow-up call.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement actual scheduling logic
    console.log('SimpleChatFollowUp: Would schedule follow-up for:', followUpDate, followUpTime);
    
    setFollowUpDate('');
    setFollowUpTime('');
    
    toast({
      title: "Follow-up Scheduled",
      description: "Follow-up call has been scheduled successfully.",
    });
  };

  if (!mentorId || !startupId) {
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
              <p>Mentor ID: {mentorId || 'missing'}</p>
              <p>Startup ID: {startupId || 'missing'}</p>
              <p>User Role: {userRole || 'missing'}</p>
              <p>Current Profile ID: {profile?.id || 'missing'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('SimpleChatFollowUp: Rendering chat interface');

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
          {/* Chat Messages Placeholder */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chat functionality coming soon. Start the conversation!</p>
            </div>
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
