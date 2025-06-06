
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, MessageSquare } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/12599393-4d4d-4f21-9167-f7dffee8ebf4.png" 
              alt="Conquest Logo" 
              className="h-16"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-primary">Conquest</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive platform connecting startups with mentors, coaches, and industry experts. 
            Streamline your journey from idea to success.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="text-lg px-8 py-6"
          >
            Access Dashboard
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>For Startups</CardTitle>
              <CardDescription>
                Connect with mentors, book sessions, and access resources to accelerate your growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Book mentor sessions via Calendly</li>
                <li>• Access to coaches, founder mentors & experts</li>
                <li>• Comprehensive resource library</li>
                <li>• Connect with cohort startups</li>
                <li>• Track your progress and forms</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>For Mentors</CardTitle>
              <CardDescription>
                Manage your availability, mentor startups, and provide valuable feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Update Calendly availability</li>
                <li>• Manage assigned startups</li>
                <li>• Submit feedback forms</li>
                <li>• Direct WhatsApp integration</li>
                <li>• Contact team & startups easily</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>For Teams</CardTitle>
              <CardDescription>
                Complete operational oversight of all sessions, schedules, and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time call monitoring</li>
                <li>• Complete schedule management</li>
                <li>• Analytics and reporting</li>
                <li>• Mentor-startup assignments</li>
                <li>• System status monitoring</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Built for seamless collaboration between startups, mentors, and operations teams
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
