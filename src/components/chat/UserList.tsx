
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare } from 'lucide-react';
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
      console.log('Fetching users for user list, current user:', profile.id);
      
      // Get all profiles except current user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, role')
        .neq('id', profile.id);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      console.log('Fetched profiles:', profiles);

      // Get startup names for startup users
      const startupUsers = profiles?.filter(p => p.role === 'startup') || [];
      const startupIds = startupUsers.map(u => u.id);

      let startupNames: Record<string, string> = {};
      if (startupIds.length > 0) {
        const { data: startups } = await supabase
          .from('startups')
          .select('profile_id, startup_name')
          .in('profile_id', startupIds);

        if (startups) {
          startupNames = startups.reduce((acc, s) => {
            acc[s.profile_id] = s.startup_name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      const usersWithStartupNames = profiles?.map(user => ({
        ...user,
        startup_name: startupNames[user.id]
      })) || [];

      console.log('Users with startup names:', usersWithStartupNames);
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
        const name = getDisplayName(user).toLowerCase();
        const startup = user.startup_name?.toLowerCase() || '';
        return name.includes(term) || startup.includes(term);
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

  const handleUserClick = (user: UserProfile) => {
    console.log('User selected:', user.id, getDisplayName(user));
    onSelectUser(user.id, getDisplayName(user));
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
          <span>Users</span>
        </CardTitle>
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
              className="pl-9"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={roleFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('all')}
            >
              All
            </Button>
            <Button
              variant={roleFilter === 'startup' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('startup')}
            >
              Startups
            </Button>
            <Button
              variant={roleFilter === 'mentor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('mentor')}
            >
              Mentors
            </Button>
            <Button
              variant={roleFilter === 'team' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('team')}
            >
              Team
            </Button>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUserId === user.id
                    ? 'bg-orange-50 border-orange-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleUserClick(user)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{getDisplayName(user)}</p>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                  {user.startup_name && (
                    <p className="text-xs text-muted-foreground">{user.startup_name}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
