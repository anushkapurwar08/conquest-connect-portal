
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Settings, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface MentorToggle {
  id: string;
  mentor_type: 'founder_mentor' | 'expert' | 'coach';
  is_visible: boolean;
  updated_at: string;
}

interface BookingWindow {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const AdminSchedulingControls: React.FC = () => {
  const [mentorToggles, setMentorToggles] = useState<MentorToggle[]>([]);
  const [bookingWindows, setBookingWindows] = useState<BookingWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchMentorToggles();
    fetchBookingWindows();
  }, []);

  const fetchMentorToggles = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_toggles')
        .select('*')
        .order('mentor_type');

      if (error) throw error;
      setMentorToggles(data || []);
    } catch (error) {
      console.error('Error fetching mentor toggles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mentor visibility settings.",
        variant: "destructive"
      });
    }
  };

  const fetchBookingWindows = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_windows')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      setBookingWindows(data || []);
    } catch (error) {
      console.error('Error fetching booking windows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch booking windows.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMentorVisibility = async (mentorType: string, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('mentor_toggles')
        .update({ 
          is_visible: isVisible, 
          updated_at: new Date().toISOString(),
          updated_by: profile?.id 
        })
        .eq('mentor_type', mentorType);

      if (error) throw error;

      setMentorToggles(prev => 
        prev.map(toggle => 
          toggle.mentor_type === mentorType 
            ? { ...toggle, is_visible: isVisible }
            : toggle
        )
      );

      toast({
        title: "Success",
        description: `${mentorType.replace('_', ' ')} visibility updated successfully.`
      });
    } catch (error) {
      console.error('Error updating mentor toggle:', error);
      toast({
        title: "Error",
        description: "Failed to update mentor visibility.",
        variant: "destructive"
      });
    }
  };

  const updateBookingWindow = async (windowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('booking_windows')
        .update({ is_active: isActive })
        .eq('id', windowId);

      if (error) throw error;

      setBookingWindows(prev => 
        prev.map(window => 
          window.id === windowId 
            ? { ...window, is_active: isActive }
            : window
        )
      );

      toast({
        title: "Success",
        description: "Booking window updated successfully."
      });
    } catch (error) {
      console.error('Error updating booking window:', error);
      toast({
        title: "Error",
        description: "Failed to update booking window.",
        variant: "destructive"
      });
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getMentorTypeDisplay = (type: string) => {
    switch (type) {
      case 'founder_mentor': return 'Founder Mentors';
      case 'expert': return 'Expert Mentors';
      case 'coach': return 'Coaches';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading admin controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mentor Visibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <Users className="h-5 w-5" />
            <span>Mentor Type Visibility Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorToggles.map((toggle) => (
              <div key={toggle.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">
                    {getMentorTypeDisplay(toggle.mentor_type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {toggle.mentor_type === 'expert' && 'Admin controlled visibility'}
                    {toggle.mentor_type === 'founder_mentor' && 'Weekly slot display'}
                    {toggle.mentor_type === 'coach' && 'Assignment-based visibility'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {toggle.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                  <Switch
                    checked={toggle.is_visible}
                    onCheckedChange={(checked) => 
                      toggleMentorVisibility(toggle.mentor_type, checked)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Window Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <Clock className="h-5 w-5" />
            <span>Booking Window Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookingWindows.map((window) => (
              <div key={window.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-medium">{window.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getDayName(window.day_of_week)} {window.start_time} - {window.end_time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={window.is_active ? 'default' : 'secondary'}>
                    {window.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={window.is_active}
                    onCheckedChange={(checked) => 
                      updateBookingWindow(window.id, checked)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSchedulingControls;
