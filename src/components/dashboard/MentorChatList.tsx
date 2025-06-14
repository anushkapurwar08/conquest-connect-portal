
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import SimpleChatFollowUp from './SimpleChatFollowUp';

interface Conversation {
  id: string;
  startup_id: string;
  created_at: string;
  updated_at: string;
  startup: {
    startup_name: string;
    description: string;
    stage: string;
    profile: {
      first_name: string | null;
      last_name: string | null;
      username: string;
    } | null;
  } | null;
  messages: Array<{
    id: string;
    content: string;
    created_at: string;
    sender_profile_id: string;
  }>;
}

const MentorChatList: React.FC = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchMentorId();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (mentorId) {
      fetchConversations();
    }
  }, [mentorId]);

  const fetchMentorId = async () => {
    if (!profile?.id) return;

    try {
      const { data: mentor, error } = await supabase
        .from('mentors')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (error) {
        console.error('Error fetching mentor:', error);
        return;
      }

      setMentorId(mentor.id);
    } catch (error) {
      console.error('Error fetching mentor ID:', error);
    }
  };

  const fetchConversations = async () => {
    if (!mentorId) return;

    try {
      setLoading(true);
      console.log('Fetching conversations for mentor:', mentorId);

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          startup_id,
          created_at,
          updated_at,
          startups!inner(
            startup_name,
            description,
            stage,
            profiles!inner(
              first_name,
              last_name,
              username
            )
          ),
          messages(
            id,
            content,
            created_at,
            sender_profile_id
          )
        `)
        .eq('mentor_id', mentorId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched conversations:', conversationsData);

      // Transform the data to match our interface
      const transformedConversations: Conversation[] = (conversationsData || []).map(conv => ({
        id: conv.id,
        startup_id: conv.startup_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        startup: conv.startups ? {
          startup_name: conv.startups.startup_name,
          description: conv.startups.description,
          stage: conv.startups.stage,
          profile: conv.startups.profiles ? {
            first_name: conv.startups.profiles.first_name,
            last_name: conv.startups.profiles.last_name,
            username: conv.startups.profiles.username
          } : null
        } : null,
        messages: (conv.messages || []).sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }));

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Unexpected error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartupDisplayName = (conversation: Conversation) => {
    if (!conversation.startup?.profile) return conversation.startup?.startup_name || 'Unknown Startup';
    
    const profile = conversation.startup.profile;
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.username;
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return 'No messages yet';
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.content.length > 50 
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content;
  };

  const getMessageTime = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return new Date(conversation.created_at);
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return new Date(lastMessage.created_at);
  };

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

  if (selectedConversation && mentorId) {
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
            Chatting with {getStartupDisplayName(selectedConversation)}
          </div>
        </div>
        
        <SimpleChatFollowUp
          userRole="mentor"
          mentorId={mentorId}
          startupId={selectedConversation.startup_id}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Your Conversations</span>
        </CardTitle>
        <CardDescription>
          Manage conversations with startups seeking your mentorship
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">
              When startups reach out to you, their conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium truncate">
                            {getStartupDisplayName(conversation)}
                          </h4>
                          {conversation.startup?.stage && (
                            <Badge variant="outline" className="text-xs">
                              {conversation.startup.stage}
                            </Badge>
                          )}
                        </div>
                        
                        {conversation.startup?.startup_name && (
                          <p className="text-sm text-muted-foreground">
                            {conversation.startup.startup_name}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {getLastMessage(conversation)}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{getMessageTime(conversation).toLocaleDateString()}</span>
                          </div>
                          <span>{conversation.messages.length} messages</span>
                        </div>
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
