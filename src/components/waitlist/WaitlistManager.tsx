
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Users, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WaitlistItem {
  id: string;
  mentor_id: string;
  startup_id: string;
  status: 'pending' | 'contacted' | 'scheduled' | 'cancelled';
  notes?: string;
  priority: number;
  added_at: string;
  contacted_at?: string;
  mentor_profile?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

interface WaitlistManagerProps {
  userRole: 'startup' | 'team';
}

const WaitlistManager: React.FC<WaitlistManagerProps> = ({ userRole }) => {
  const [waitlistItems, setWaitlistItems] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchWaitlistData();
    }
  }, [profile]);

  const fetchWaitlistData = async () => {
    try {
      if (userRole === 'startup') {
        // Get startup's waitlist
        const { data: startup } = await supabase
          .from('startups')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();

        if (startup) {
          const { data: waitlist } = await supabase
            .from('waitlist')
            .select(`
              *,
              mentors!inner(
                profiles!inner(username, first_name, last_name)
              )
            `)
            .eq('startup_id', startup.id);

          if (waitlist) {
            const formattedWaitlist = waitlist.map(item => ({
              ...item,
              mentor_profile: (item as any).mentors.profiles
            }));
            setWaitlistItems(formattedWaitlist);
          }
        }
      } else {
        // Team view - get all waitlist items with counts
        const { data: waitlist } = await supabase
          .from('waitlist')
          .select(`
            *,
            mentors!inner(
              profiles!inner(username, first_name, last_name)
            ),
            startups!inner(
              profiles!inner(username)
            )
          `);

        if (waitlist) {
          const formattedWaitlist = waitlist.map(item => ({
            ...item,
            mentor_profile: (item as any).mentors.profiles
          }));
          setWaitlistItems(formattedWaitlist);
        }
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to load waitlist data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWaitlist = async (waitlistId: string) => {
    try {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', waitlistId);

      if (error) throw error;

      setWaitlistItems(prev => prev.filter(item => item.id !== waitlistId));
      toast({
        title: "Removed from Waitlist",
        description: "Mentor has been removed from your waitlist.",
      });
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove from waitlist",
        variant: "destructive",
      });
    }
  };

  const getMentorDisplayName = (mentorProfile: any) => {
    if (mentorProfile?.first_name && mentorProfile?.last_name) {
      return `${mentorProfile.first_name} ${mentorProfile.last_name}`;
    }
    return mentorProfile?.username || 'Unknown';
  };

  const getMentorInitials = (mentorProfile: any) => {
    if (mentorProfile?.first_name && mentorProfile?.last_name) {
      return `${mentorProfile.first_name[0]}${mentorProfile.last_name[0]}`;
    }
    return mentorProfile?.username?.slice(0, 2).toUpperCase() || 'UN';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </CardContent>
      </Card>
    );
  }

  if (userRole === 'startup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>My Waitlist</span>
          </CardTitle>
          <CardDescription>
            Mentors you're waiting to get slots with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {waitlistItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No mentors in your waitlist
            </p>
          ) : (
            <div className="space-y-3">
              {waitlistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {getMentorInitials(item.mentor_profile)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getMentorDisplayName(item.mentor_profile)}</p>
                      <p className="text-sm text-muted-foreground">
                        Added on {new Date(item.added_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        item.status === 'scheduled' ? 'default' : 
                        item.status === 'contacted' ? 'secondary' : 'outline'
                      }
                    >
                      {item.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeFromWaitlist(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Team view - group by mentor and show counts
  const mentorCounts = waitlistItems.reduce((acc, item) => {
    const mentorId = item.mentor_id;
    if (!acc[mentorId]) {
      acc[mentorId] = {
        mentor_profile: item.mentor_profile,
        count: 0,
        items: []
      };
    }
    acc[mentorId].count++;
    acc[mentorId].items.push(item);
    return acc;
  }, {} as any);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Mentor Waitlist Analytics</span>
        </CardTitle>
        <CardDescription>
          See which mentors are most in demand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.values(mentorCounts)
            .filter((mentor: any) => mentor.count > 0)
            .sort((a: any, b: any) => b.count - a.count)
            .map((mentor: any) => (
              <div key={mentor.mentor_profile?.username} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {getMentorInitials(mentor.mentor_profile)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getMentorDisplayName(mentor.mentor_profile)}</p>
                    <p className="text-sm text-muted-foreground">Mentor</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {mentor.count} waitlisted
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          {Object.keys(mentorCounts).length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No waitlist data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { WaitlistManager, type WaitlistItem };
export default WaitlistManager;
