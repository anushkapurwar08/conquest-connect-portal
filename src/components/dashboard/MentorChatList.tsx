
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

interface ConversationWithProfile {
  id: string;
  other_profile_id: string;
  other_profile_name: string;
  other_profile_role: string;
  startup_name?: string;
  created_at: string;
  updated_at: string;
  last_message: string;
  last_message_time: string;
  message_count: number;
  unread_count: number;
}

const MentorChatList: React.FC = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchConversations();
    }
  }, [profile?.id]);

  const fetchConversations = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      console.log('MentorChatList: Fetching conversations for profile:', profile.id);

      // Get all conversations where this profile is involved
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          mentor_id,
          startup_id,
          created_at,
          updated_at
        `)
        .or(`mentor_id.eq.${profile.id},startup_id.eq.${profile.id}`)
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

      // Get profile details for each conversation participant
      const conversationsWithProfiles = await Promise.all(
        conversationsData.map(async (conv) => {
          // Determine which profile is the "other" person
          const otherProfileId = conv.mentor_id === profile.id ? conv.startup_id : conv.mentor_id;
          
          // Get the other person's profile
          const { data: otherProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, first_name, last_name, role')
            .eq('id', otherProfileId)
            .single();

          if (profileError) {
            console.error('Error fetching other profile:', profileError);
            return null;
          }

          // Get startup name if the other person is a startup
          let startupName = null;
          if (otherProfile?.role === 'startup') {
            const { data: startup } = await supabase
              .from('startups')
              .select('startup_name')
              .eq('profile_id', otherProfile.id)
              .single();
            startupName = startup?.startup_name;
          }

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
          
          // Count unread messages (messages from other person)
          const unreadCount = messages ? messages.filter(m => m.sender_profile_id === otherProfile?.id).length : 0;

          // Create display name
          let displayName = 'Unknown User';
          if (otherProfile) {
            if (otherProfile.first_name && otherProfile.last_name) {
              displayName = `${otherProfile.first_name} ${otherProfile.last_name}`;
            } else {
              displayName = otherProfile.username;
            }
          }

          return {
            id: conv.id,
            other_profile_id: otherProfileId,
            other_profile_name: displayName,
            other_profile_role: otherProfile?.role || 'unknown',
            startup_name: startupName,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            last_message: lastMessage ? 
              (lastMessage.content.length > 50 ? `${lastMessage.content.substring(0, 50)}...` : lastMessage.content) : 
              'No messages yet',
            last_message_time: lastMessage ? lastMessage.created_at : conv.created_at,
            message_count: messageCount,
            unread_count: unreadCount
          };
        })
      );

      const validConversations = conversationsWithProfiles.filter(conv => conv !== null) as ConversationWithProfile[];
      console.log('MentorChatList: Processed conversations:', validConversations);
      setConversations(validConversations);
      setError(null);
    } catch (error) {
      console.error('MentorChatList: Unexpected error:', error);
      setError('An unexpected error occurred while loading conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: ConversationWithProfile) => {
    console.log('MentorChatList: Opening conversation:', {
      conversationId: conversation.id,
      currentProfileId: profile?.id,
      otherProfileId: conversation.other_profile_id
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
            <Button onClick={fetchConversations} className="mt-4">
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
            Chatting with {selectedConversation.other_profile_name}
            {selectedConversation.startup_name && ` from ${selectedConversation.startup_name}`}
          </div>
        </div>
        
        <SimpleChatFollowUp
          conversationId={selectedConversation.id}
          otherProfileId={selectedConversation.other_profile_id}
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
          Your messages and conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">
              When you start messaging someone, your conversations will appear here.
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
                          {conversation.other_profile_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {conversation.other_profile_name}
                          </h4>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              {conversation.unread_count} new
                            </Badge>
                          )}
                        </div>
                        
                        {conversation.startup_name && (
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {conversation.startup_name}
                          </p>
                        )}
                        
                        <Badge variant="outline" className="text-xs mb-2">
                          {conversation.other_profile_role}
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
