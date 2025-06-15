
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  startup_name?: string;
}

interface UserListProps {
  onSelectUser: (user: UserProfile) => void;
  selectedUserId?: string;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, selectedUserId }) => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, [profile?.id]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      console.log('UserList: Fetching all users except current user');

      // Get all profiles except current user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, role')
        .neq('id', profile.id)
        .order('username');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Enrich startup users with startup names
      const enrichedUsers = await Promise.all(
        (profiles || []).map(async (user) => {
          if (user.role === 'startup') {
            const { data: startup } = await supabase
              .from('startups')
              .select('startup_name')
              .eq('profile_id', user.id)
              .maybeSingle();
            
            return {
              ...user,
              startup_name: startup?.startup_name
            };
          }
          return user;
        })
      );

      console.log('UserList: Fetched users:', enrichedUsers);
      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return (
          user.username.toLowerCase().includes(searchLower) ||
          fullName.toLowerCase().includes(searchLower) ||
          (user.startup_name && user.startup_name.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredUsers(filtered);
  };

  const getDisplayName = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  const getInitials = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Start a Conversation</span>
        </CardTitle>
        <CardDescription>
          Select a user to start messaging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={selectedRole === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('all')}
            >
              All
            </Button>
            <Button
              variant={selectedRole === 'mentor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('mentor')}
            >
              Mentors
            </Button>
            <Button
              variant={selectedRole === 'startup' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('startup')}
            >
              Startups
            </Button>
            <Button
              variant={selectedRole === 'team' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('team')}
            >
              Team
            </Button>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card 
                key={user.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUserId === user.id ? 'border-orange-500 bg-orange-50' : ''
                }`}
                onClick={() => onSelectUser(user)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {getDisplayName(user)}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                      
                      {user.startup_name && (
                        <p className="text-sm text-gray-600 truncate">
                          {user.startup_name}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
