
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Users, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WaitlistItem {
  mentorId: string;
  mentorName: string;
  dateAdded: string;
  status: 'pending' | 'contacted' | 'scheduled';
}

interface WaitlistManagerProps {
  userRole: 'startup' | 'team';
}

const WaitlistManager: React.FC<WaitlistManagerProps> = ({ userRole }) => {
  const [waitlistItems, setWaitlistItems] = useState<WaitlistItem[]>([
    { mentorId: '1', mentorName: 'John Smith', dateAdded: '2024-12-20', status: 'pending' },
    { mentorId: '2', mentorName: 'Sarah Johnson', dateAdded: '2024-12-19', status: 'contacted' }
  ]);

  // Mock data for team view - mentor waitlist counts
  const mentorWaitlistCounts = [
    { mentorId: '1', mentorName: 'John Smith', waitlistCount: 3, expertise: 'Product Strategy' },
    { mentorId: '2', mentorName: 'Sarah Johnson', waitlistCount: 5, expertise: 'Marketing' },
    { mentorId: '3', mentorName: 'Mike Chen', waitlistCount: 2, expertise: 'Technology' },
    { mentorId: '4', mentorName: 'Lisa Wong', waitlistCount: 1, expertise: 'Finance' }
  ];

  const removeFromWaitlist = (mentorId: string) => {
    setWaitlistItems(prev => prev.filter(item => item.mentorId !== mentorId));
    toast({
      title: "Removed from Waitlist",
      description: "Mentor has been removed from your waitlist.",
    });
  };

  const addToWaitlist = (mentorId: string, mentorName: string) => {
    const newItem: WaitlistItem = {
      mentorId,
      mentorName,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setWaitlistItems(prev => [...prev, newItem]);
    toast({
      title: "Added to Waitlist",
      description: `${mentorName} has been added to your waitlist. The team will be notified.`,
    });
  };

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
                <div key={item.mentorId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {item.mentorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.mentorName}</p>
                      <p className="text-sm text-muted-foreground">
                        Added on {item.dateAdded}
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
                      onClick={() => removeFromWaitlist(item.mentorId)}
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

  // Team view
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
          {mentorWaitlistCounts
            .filter(mentor => mentor.waitlistCount > 0)
            .sort((a, b) => b.waitlistCount - a.waitlistCount)
            .map((mentor) => (
              <div key={mentor.mentorId} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {mentor.mentorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mentor.mentorName}</p>
                    <p className="text-sm text-muted-foreground">{mentor.expertise}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {mentor.waitlistCount} waitlisted
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { WaitlistManager, type WaitlistItem };
export default WaitlistManager;
