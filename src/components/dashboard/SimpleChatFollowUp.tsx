
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimpleChatFollowUpProps {
  userRole: 'startup' | 'mentor';
}

interface Message {
  id: string;
  sender: 'startup' | 'mentor';
  content: string;
  timestamp: string;
  type: 'message' | 'follow_up_call';
}

const SimpleChatFollowUp: React.FC<SimpleChatFollowUpProps> = ({ userRole }) => {
  const [newMessage, setNewMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'mentor',
      content: 'Great session today! How are you feeling about the product strategy we discussed?',
      timestamp: '2024-12-20 15:30',
      type: 'message'
    },
    {
      id: '2',
      sender: 'startup',
      content: 'Thank you! I found the market positioning insights very valuable. Working on implementing the changes.',
      timestamp: '2024-12-20 16:15',
      type: 'message'
    }
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: userRole,
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      type: 'message'
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });
  };

  const handleScheduleFollowUp = () => {
    if (!followUpDate || !followUpTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for follow-up call.",
        variant: "destructive"
      });
      return;
    }

    const followUpMessage: Message = {
      id: Date.now().toString(),
      sender: userRole,
      content: `Follow-up call scheduled for ${followUpDate} at ${followUpTime}`,
      timestamp: new Date().toLocaleString(),
      type: 'follow_up_call'
    };

    setMessages([...messages, followUpMessage]);
    setFollowUpDate('');
    setFollowUpTime('');
    
    toast({
      title: "Follow-up Scheduled",
      description: "Follow-up call has been scheduled successfully.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Chat with {userRole === 'startup' ? 'Mentor' : 'Startup'}</span>
          </CardTitle>
          <CardDescription>
            Simple 1-on-1 communication and follow-up scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === userRole ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs p-3 rounded-lg ${
                  message.sender === userRole 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.type === 'follow_up_call' && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs font-medium">Follow-up Call</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === userRole ? 'text-orange-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
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
