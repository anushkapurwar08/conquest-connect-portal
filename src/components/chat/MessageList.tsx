
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MessagePreview {
  id: string;
  content: string;
  created_at: string;
  sender_profile_id: string;
  sender_name: string;
  sender_username: string;
  sender_role: string;
  sender_startup_name?: string;
  unread: boolean;
}

interface MessageListProps {
  onSelectConversation: (userId: string, userName: string, userRole: string, startupName?: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ onSelectConversation }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<MessagePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchReceivedMessages();
      
      // Setup realtime subscription with proper cleanup
      const channel = supabase
        .channel(`messages_channel_${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_profile_id=eq.${profile.id}`
          },
          () => {
            console.log('MessageList: New message received, refreshing list');
            fetchReceivedMessages();
          }
        )
        .subscribe();

      // Cleanup function
      return () => {
        console.log('MessageList: Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id]);

  const fetchReceivedMessages = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      console.log('MessageList: Fetching received messages for user:', profile.id);

      // Get the latest message from each sender
      const { data: latestMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_profile_id,
          profiles!messages_sender_profile_id_fkey(
            username,
            first_name,
            last_name,
            role
          )
        `)
        .eq('receiver_profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Group by sender and get the latest message from each
      const groupedMessages = new Map();
      
      for (const message of latestMessages || []) {
        if (!groupedMessages.has(message.sender_profile_id)) {
          // Get startup name if sender is a startup
          let startupName = '';
          if (message.profiles?.role === 'startup') {
            const { data: startup } = await supabase
              .from('startups')
              .select('startup_name')
              .eq('profile_id', message.sender_profile_id)
              .maybeSingle();
            startupName = startup?.startup_name || '';
          }

          const senderName = message.profiles?.first_name && message.profiles?.last_name
            ? `${message.profiles.first_name} ${message.profiles.last_name}`
            : message.profiles?.username || 'Unknown User';

          groupedMessages.set(message.sender_profile_id, {
            id: message.id,
            content: message.content,
            created_at: message.created_at,
            sender_profile_id: message.sender_profile_id,
            sender_name: senderName,
            sender_username: message.profiles?.username || '',
            sender_role: message.profiles?.role || '',
            sender_startup_name: startupName,
            unread: true // You can implement read status tracking later
          });
        }
      }

      const messageList = Array.from(groupedMessages.values());
      console.log('MessageList: Processed messages:', messageList);
      setMessages(messageList);
    } catch (error) {
      console.error('Unexpected error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Recent Messages</span>
        </CardTitle>
        <CardDescription>
          Your latest conversations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400">Start a conversation to see messages here</p>
          </div>
        ) : (
          messages.map((message) => (
            <Card
              key={message.sender_profile_id}
              className="cursor-pointer transition-all hover:shadow-md hover:bg-accent"
              onClick={() => onSelectConversation(
                message.sender_profile_id,
                message.sender_name,
                message.sender_role,
                message.sender_startup_name
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {message.sender_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {message.sender_name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {message.sender_role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.created_at)}</span>
                      </div>
                    </div>
                    
                    {message.sender_startup_name && (
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {message.sender_startup_name}
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {truncateMessage(message.content)}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      @{message.sender_username}
                    </p>
                  </div>
                  
                  {message.unread && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default MessageList;
