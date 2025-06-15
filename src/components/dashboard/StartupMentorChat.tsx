
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SimplifiedChat from '@/components/chat/SimplifiedChat';

const StartupMentorChat: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect with Mentors</CardTitle>
        <CardDescription>
          Message any mentor, startup, or team member in the portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimplifiedChat userRole="startup" />
      </CardContent>
    </Card>
  );
};

export default StartupMentorChat;
