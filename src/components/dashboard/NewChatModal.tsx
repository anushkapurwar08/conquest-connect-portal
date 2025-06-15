import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (otherProfileId: string) => void;
  currentProfileId: string;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onStartChat, currentProfileId }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, role')
        .neq('id', currentProfileId);
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, [currentProfileId]);

  const filteredUsers = users.filter((user) => {
    const name = `${user.first_name || ''} ${user.last_name || ''} ${user.username || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Start New Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">No users found.</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-orange-50 cursor-pointer"
                  onClick={() => { onStartChat(user.id); onClose(); }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {(user.first_name && user.last_name)
                        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                        : (user.username ? user.username[0].toUpperCase() : '?')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewChatModal; 