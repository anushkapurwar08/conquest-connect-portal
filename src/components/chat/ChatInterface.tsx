
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserList from './UserList';
import DirectChat from './DirectChat';
import MessageList from './MessageList';
import { MessageSquare, Users, Inbox } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  startup_name?: string;
}

const ChatInterface: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('messages');

  const handleSelectUser = (user: UserProfile) => {
    console.log('ChatInterface: Selected user:', user);
    setSelectedUser(user);
  };

  const handleSelectFromMessages = (userId: string, userName: string, userRole: string, startupName?: string) => {
    const user: UserProfile = {
      id: userId,
      username: userName, // We'll use the display name as username for now
      first_name: userName.split(' ')[0] || null,
      last_name: userName.split(' ')[1] || null,
      role: userRole,
      startup_name: startupName
    };
    
    console.log('ChatInterface: Selected from messages:', user);
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <DirectChat 
        otherUser={selectedUser} 
        onBack={handleBack}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="messages" className="flex items-center space-x-2">
          <Inbox className="h-4 w-4" />
          <span>Messages</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>New Chat</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="messages" className="mt-6">
        <MessageList onSelectConversation={handleSelectFromMessages} />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <UserList 
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUser?.id}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ChatInterface;
