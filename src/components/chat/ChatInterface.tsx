
import React, { useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

const ChatInterface: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherProfileId: string;
    otherProfileName: string;
  } | null>(null);

  const handleSelectConversation = (conversationId: string, otherProfileId: string, otherProfileName: string) => {
    setSelectedConversation({
      id: conversationId,
      otherProfileId,
      otherProfileName
    });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (selectedConversation) {
    return (
      <ChatWindow
        conversationId={selectedConversation.id}
        otherProfileId={selectedConversation.otherProfileId}
        otherProfileName={selectedConversation.otherProfileName}
        onBack={handleBackToList}
      />
    );
  }

  return <ConversationList onSelectConversation={handleSelectConversation} />;
};

export default ChatInterface;
