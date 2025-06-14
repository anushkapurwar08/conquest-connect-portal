
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type UserRole = 'startup' | 'mentor' | 'team';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const authenticateUser = (username: string, password: string): UserRole | null => {
    // Startup authentication: startupname_conquest / startupname_refcode
    if (username.endsWith('_conquest')) {
      const startupName = username.replace('_conquest', '');
      if (password === `${startupName}_refcode`) {
        return 'startup';
      }
    }
    
    // Team authentication: firstname / surname
    const teamCredentials = [
      { username: 'john', password: 'doe' },
      { username: 'jane', password: 'smith' },
      { username: 'admin', password: 'admin' }
    ];
    
    if (teamCredentials.some(cred => cred.username === username.toLowerCase() && cred.password === password.toLowerCase())) {
      return 'team';
    }
    
    // Mentor authentication (simplified for demo)
    const mentorCredentials = [
      { username: 'mentor1', password: 'mentor123' },
      { username: 'johnsmith', password: 'mentor456' }
    ];
    
    if (mentorCredentials.some(cred => cred.username === username.toLowerCase() && cred.password === password.toLowerCase())) {
      return 'mentor';
    }
    
    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const role = authenticateUser(username, password);
    
    if (role) {
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', username);
      
      toast({
        title: "Login Successful",
        description: `Welcome ${role}!`,
      });
      
      navigate('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please check your username and password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/lovable-uploads/12599393-4d4d-4f21-9167-f7dffee8ebf4.png" 
            alt="Conquest Logo" 
            className="h-12 mx-auto mb-4"
          />
          <CardTitle className="text-2xl font-bold">Welcome to Conquest</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
