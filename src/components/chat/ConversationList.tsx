
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';

interface ConversationListProps {
  onSelectConversation: (conversationId: string, otherProfileId: string, otherProfileName: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { conversations, loading } = useConversations();

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

  if (conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Start a conversation to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Conversations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-transparent hover:border-l-orange-500"
              onClick={() => onSelectConversation(
                conversation.id, 
                conversation.other_profile_id, 
                conversation.other_profile_name
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {conversation.other_profile_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {conversation.other_profile_name}
                      </h4>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    
                    <Badge variant="outline" className="text-xs mb-2">
                      {conversation.other_profile_role}
                    </Badge>
                    
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {conversation.last_message}
                    </p>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{new Date(conversation.last_message_time).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationList;
