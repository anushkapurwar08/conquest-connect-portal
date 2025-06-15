import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, MessageSquare } from 'lucide-react';
import MentorChatList from './MentorChatList';
import AdminSchedulingControls from '@/components/admin/AdminSchedulingControls';
import CoachAssignmentManager from '@/components/admin/CoachAssignmentManager';
import { useAuth } from '@/hooks/useAuth';

const MentorChatDashboard: React.FC = () => {
  const { profile } = useAuth();
  const isTeamMember = profile?.role === 'team';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Chat</h2>
        <p className="text-gray-600">Manage your conversations with anyone</p>
      </div>
      
      {isTeamMember ? (
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Scheduling Controls</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Coach Assignments</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-6">
            <MentorChatList />
          </TabsContent>
          
          <TabsContent value="scheduling" className="mt-6">
            <AdminSchedulingControls />
          </TabsContent>
          
          <TabsContent value="assignments" className="mt-6">
            <CoachAssignmentManager />
          </TabsContent>
          
          <TabsContent value="follow-up">
            <MentorChatList />
          </TabsContent>
        </Tabs>
      ) : (
        <MentorChatList />
      )}
    </div>
  );
};

export default MentorChatDashboard;
