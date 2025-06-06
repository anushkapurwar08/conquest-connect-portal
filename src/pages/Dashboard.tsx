
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Clock, BookOpen, Phone, Settings } from 'lucide-react';
import StartupDashboard from '@/components/dashboard/StartupDashboard';
import MentorDashboard from '@/components/dashboard/MentorDashboard';
import TeamDashboard from '@/components/dashboard/TeamDashboard';

type UserRole = 'startup' | 'mentor' | 'team';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole>('startup');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/12599393-4d4d-4f21-9167-f7dffee8ebf4.png" 
                alt="Conquest Logo" 
                className="h-8"
              />
              <h1 className="text-2xl font-bold">Conquest Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-background border border-border rounded px-3 py-2"
              >
                <option value="startup">Startup View</option>
                <option value="mentor">Mentor View</option>
                <option value="team">Team View</option>
              </select>
              
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {userRole === 'startup' && <StartupDashboard />}
        {userRole === 'mentor' && <MentorDashboard />}
        {userRole === 'team' && <TeamDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
