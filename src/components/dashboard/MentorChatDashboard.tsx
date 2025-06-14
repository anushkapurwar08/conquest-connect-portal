
import React from 'react';
import MentorChatList from './MentorChatList';

const MentorChatDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mentor Chat</h2>
        <p className="text-gray-600">Manage your conversations with startups</p>
      </div>
      
      <MentorChatList />
    </div>
  );
};

export default MentorChatDashboard;
