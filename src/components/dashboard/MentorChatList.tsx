
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import SimpleChatFollowUp from './SimpleChatFollowUp';

interface ConversationWithStartup {
  id: string;
  startup_id: string;
  mentor_id: string;
  created_at: string;
  updated_at: string;
  startup_name: string;
  startup_founder_name: string;
  startup_stage: string;
  last_message: string;
  last_message_time: string;
  message_count: number;
  unread_count: number;
}

const MentorChatList: React.FC = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithStartup[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithStartup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchMentorConversations();
    }
  }, [profile?.id]);

  const fetchMentorConversations = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      console.log('MentorChatList: Fetching conversations for profile:', profile.id);

      // First get the mentor record
      const { data: mentor, error: mentorError } = await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (mentorError) {
        console.error('MentorChatList: Error fetching mentor:', mentorError);
        setError(`Failed to load mentor profile: ${mentorError.message}`);
        return;
      }

      if (!mentor) {
        console.log('MentorChatList: No mentor record found');
        setError('No mentor profile found. Please ensure your account is set up as a mentor.');
        return;
      }

      console.log('MentorChatList: Found mentor ID:', mentor.id);

      // Now get conversations with startup details and message info
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          startup_id,
          mentor_id,
          created_at,
          updated_at,
          startups!inner(
            startup_name,
            stage,
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('mentor_id', mentor.id)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('MentorChatList: Error fetching conversations:', conversationsError);
        setError(`Failed to load conversations: ${conversationsError.message}`);
        return;
      }

      console.log('MentorChatList: Raw conversations data:', conversationsData);

      if (!conversationsData || conversationsData.length === 0) {
        console.log('MentorChatList: No conversations found');
        setConversations([]);
        setError(null);
        return;
      }

      // Get message info for each conversation
      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conv) => {
          // Get last message and count
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('content, created_at, sender_profile_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false });

          if (messagesError) {
            console.error('Error fetching messages for conversation:', conv.id, messagesError);
          }

          const lastMessage = messages && messages.length > 0 ? messages[0] : null;
          const messageCount = messages ? messages.length : 0;
          
          // Count unread messages (messages from startup to mentor that are "unread")
          // For simplicity, we'll just show if there are any messages
          const unreadCount = messages ? messages.filter(m => m.sender_profile_id !== profile.id).length : 0;

          const startup = conv.startups;
          const startupProfile = startup?.profiles;
          
          let founderName = 'Unknown';
          if (startupProfile) {
            if (startupProfile.first_name && startupProfile.last_name) {
              founderName = `${startupProfile.first_name} ${startupProfile.last_name}`;
            } else {
              founderName = startupProfile.username;
            }
          }

          return {
            id: conv.id,
            startup_id: conv.startup_id,
            mentor_id: conv.mentor_id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            startup_name: startup?.startup_name || 'Unknown Startup',
            startup_founder_name: founderName,
            startup_stage: startup?.stage || 'Unknown',
            last_message: lastMessage ? 
              (lastMessage.content.length > 50 ? `${lastMessage.content.substring(0, 50)}...` : lastMessage.content) : 
              'No messages yet',
            last_message_time: lastMessage ? lastMessage.created_at : conv.created_at,
            message_count: messageCount,
            unread_count: unreadCount
          };
        })
      );

      console.log('MentorChatList: Processed conversations:', conversationsWithMessages);
      setConversations(conversationsWithMessages);
      setError(null);
    } catch (error) {
      console.error('MentorChatList: Unexpected error:', error);
      setError('An unexpected error occurred while loading conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: ConversationWithStartup) => {
    console.log('MentorChatList: Opening conversation:', {
      conversationId: conversation.id,
      mentorId: conversation.mentor_id,
      startupId: conversation.startup_id
    });
    setSelectedConversation(conversation);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Conversations</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMentorConversations} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  // Show selected conversation chat
  if (selectedConversation) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedConversation(null)}
            className="flex items-center space-x-2"
          >
            <span>← Back to Conversations</span>
          </Button>
          <div className="text-sm text-muted-foreground">
            Chatting with {selectedConversation.startup_founder_name} from {selectedConversation.startup_name}
          </div>
        </div>
        
        <SimpleChatFollowUp
          userRole="mentor"
          mentorId={selectedConversation.mentor_id}
          startupId={selectedConversation.startup_id}
        />
      </div>
    );
  }

  // Show conversations list
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Your Conversations</span>
        </CardTitle>
        <CardDescription>
          Messages from startups seeking your mentorship
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">
              When startups message you, their conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-transparent hover:border-l-orange-500"
                onClick={() => handleSelectConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {conversation.startup_founder_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {conversation.startup_founder_name}
                          </h4>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              {conversation.unread_count} new
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {conversation.startup_name}
                        </p>
                        
                        <Badge variant="outline" className="text-xs mb-2">
                          {conversation.startup_stage}
                        </Badge>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {conversation.last_message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(conversation.last_message_time).toLocaleDateString()}</span>
                          </div>
                          <span>{conversation.message_count} messages</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {new Date(conversation.last_message_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MentorChatList;
