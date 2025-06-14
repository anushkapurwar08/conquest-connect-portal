
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Clock, BookOpen, Phone, Settings, LogOut } from 'lucide-react';
import StartupDashboard from '@/components/dashboard/StartupDashboard';
import MentorDashboard from '@/components/dashboard/MentorDashboard';
import TeamDashboard from '@/components/dashboard/TeamDashboard';

type UserRole = 'startup' | 'mentor' | 'team';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole>('startup');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedRole = localStorage.getItem('userRole') as UserRole;
    const storedUsername = localStorage.getItem('username');
    
    if (!storedRole || !storedUsername) {
      navigate('/login');
      return;
    }
    
    setUserRole(storedRole);
    setUsername(storedUsername);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    // This is for demo purposes - in real app, users wouldn't switch roles
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

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
              <h1 className="text-2xl font-bold text-orange-600">Conquest Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
              
              <select 
                value={userRole} 
                onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
                className="bg-background border border-border rounded px-3 py-2"
              >
                <option value="startup">Startup View</option>
                <option value="mentor">Mentor View</option>
                <option value="team">Team View</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{username}</span>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
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
