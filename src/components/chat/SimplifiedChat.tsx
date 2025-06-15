
import React, { useState } from 'react';
import UserList from './UserList';
import DirectChat from './DirectChat';

const SimplifiedChat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <DirectChat
        otherUserId={selectedUser.id}
        otherUserName={selectedUser.name}
        onBack={handleBackToUserList}
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
