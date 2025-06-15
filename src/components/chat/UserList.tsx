
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageSquare, User } from 'lucide-react';
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
  onSelectUser: (user: UserProfile) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
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
      // Get all profiles except current user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, role')
        .neq('id', profile.id);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get startup names for startup users
      const startupUsers = profilesData?.filter(p => p.role === 'startup') || [];
      const startupIds = startupUsers.map(u => u.id);

      let startupNames: Record<string, string> = {};
      if (startupIds.length > 0) {
        const { data: startupData } = await supabase
          .from('startups')
          .select('profile_id, startup_name')
          .in('profile_id', startupIds);

        startupNames = (startupData || []).reduce((acc, startup) => {
          acc[startup.profile_id] = startup.startup_name;
          return acc;
        }, {} as Record<string, string>);
      }

      // Combine profile data with startup names
      const usersWithStartupNames: UserProfile[] = (profilesData || []).map(profile => ({
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
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const username = user.username.toLowerCase();
        const startupName = (user.startup_name || '').toLowerCase();
        
        return fullName.includes(term) || 
               username.includes(term) || 
               startupName.includes(term);
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
          Select a user to start chatting with
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="mentor">Mentors</option>
            <option value="startup">Startups</option>
            <option value="team">Team</option>
          </select>
        </div>

        {/* User List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card 
                key={user.id}
                className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-transparent hover:border-l-orange-500"
                onClick={() => onSelectUser(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
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
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      Chat
                    </Button>
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
