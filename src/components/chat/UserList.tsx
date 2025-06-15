
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  startup_name?: string;
}

interface UserListProps {
  onSelectUser: (userId: string, userName: string) => void;
  selectedUserId?: string;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, selectedUserId }) => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [profile?.id]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      // Get all profiles except current user
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, role')
        .neq('id', profile.id);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get startup names for startup users
      const startupUsers = profiles?.filter(p => p.role === 'startup') || [];
      const startupIds = startupUsers.map(p => p.id);

      let startupNames: { [key: string]: string } = {};
      if (startupIds.length > 0) {
        const { data: startups } = await supabase
          .from('startups')
          .select('profile_id, startup_name')
          .in('profile_id', startupIds);

        if (startups) {
          startupNames = startups.reduce((acc, startup) => {
            acc[startup.profile_id] = startup.startup_name;
            return acc;
          }, {} as { [key: string]: string });
        }
      }

      // Combine profile data with startup names
      const usersWithStartupNames: UserProfile[] = (profiles || []).map(profile => ({
        ...profile,
        startup_name: startupNames[profile.id]
      }));

      setUsers(usersWithStartupNames);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const displayName = getDisplayName(user).toLowerCase();
        const startupName = user.startup_name?.toLowerCase() || '';
        return displayName.includes(term) || startupName.includes(term);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'startup': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <User className="h-5 w-5" />
          <span>Portal Users</span>
        </CardTitle>
        <CardDescription>
          Select a user to start a conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={roleFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={roleFilter === 'mentor' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('mentor')}
            >
              Mentors
            </Button>
            <Button
              size="sm"
              variant={roleFilter === 'startup' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('startup')}
            >
              Startups
            </Button>
            <Button
              size="sm"
              variant={roleFilter === 'team' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('team')}
            >
              Team
            </Button>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent ${
                  selectedUserId === user.id ? 'bg-orange-50 border-orange-200' : 'border-gray-200'
                }`}
                onClick={() => onSelectUser(user.id, getDisplayName(user))}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">
                      {getDisplayName(user)}
                    </p>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </div>
                  
                  {user.startup_name && (
                    <p className="text-sm text-gray-600 truncate">
                      {user.startup_name}
                    </p>
                  )}
                </div>
                
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
