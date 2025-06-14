
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import StartupDashboard from '@/components/dashboard/StartupDashboard';
import MentorDashboard from '@/components/dashboard/MentorDashboard';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.username;
  };

  const getInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`;
    }
    return profile.username.slice(0, 2).toUpperCase();
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
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
              
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{getDisplayName()}</span>
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
        {profile.role === 'startup' && <StartupDashboard />}
        {profile.role === 'mentor' && <MentorDashboard />}
        {profile.role === 'team' && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Team dashboard has been removed. Please contact support if you need access.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
