
import React, { useState } from 'react';
import UserList from './UserList';
import DirectChat from './DirectChat';

interface UserProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  startup_name?: string;
}

const SimplifiedChat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return <DirectChat otherUser={selectedUser} onBack={handleBack} />;
  }

  return <UserList onSelectUser={handleSelectUser} />;
};

export default SimplifiedChat;
