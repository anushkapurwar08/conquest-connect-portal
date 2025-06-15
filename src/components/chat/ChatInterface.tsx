
import React, { useState } from 'react';
import UserList from './UserList';
import DirectChat from './DirectChat';

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

  const handleSelectUser = (user: UserProfile) => {
    console.log('ChatInterface: Selected user:', user);
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
    <UserList 
      onSelectUser={handleSelectUser}
      selectedUserId={selectedUser?.id}
    />
  );
};

export default ChatInterface;
