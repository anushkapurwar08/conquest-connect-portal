
import React, { useState } from 'react';
import UserList from './UserList';
import DirectChat from './DirectChat';

interface SimplifiedChatProps {
  userRole?: string;
}

const SimplifiedChat: React.FC<SimplifiedChatProps> = ({ userRole }) => {
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <DirectChat
        receiverId={selectedUser.id}
        receiverName={selectedUser.name}
        onBack={handleBackToUsers}
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

export default SimplifiedChat;
