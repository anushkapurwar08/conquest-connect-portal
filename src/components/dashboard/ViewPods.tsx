
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Pod {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  capacity: number;
  current_attendees: number;
  mentor_name: string;
  mentor_type: string;
  is_active: boolean;
}

const ViewPods: React.FC = () => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchPods();
  }, []);

  const fetchPods = async () => {
    try {
      const { data, error } = await supabase
        .from('pods')
        .select(`
          id,
          name,
          description,
          location,
          date,
          time,
          capacity,
          current_attendees,
          is_active,
          mentors!inner(
            mentor_type,
            profiles!inner(
              first_name,
              last_name,
              username
            )
          )
        `)
        .eq('is_active', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching pods:', error);
        toast({
          title: "Error",
          description: "Failed to load pods. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const formattedPods: Pod[] = data?.map((pod: any) => ({
        id: pod.id,
        name: pod.name,
        description: pod.description,
        location: pod.location,
        date: pod.date,
        time: pod.time,
        capacity: pod.capacity,
        current_attendees: pod.current_attendees || 0,
        is_active: pod.is_active,
        mentor_type: pod.mentors?.mentor_type || 'expert',
        mentor_name: pod.mentors?.profiles?.first_name && pod.mentors?.profiles?.last_name
          ? `${pod.mentors.profiles.first_name} ${pod.mentors.profiles.last_name}`
          : pod.mentors?.profiles?.username || 'Unknown Mentor'
      })) || [];

      setPods(formattedPods);
    } catch (error) {
      console.error('Error fetching pods:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading pods.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPod = async (podId: string) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to join a pod.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, get the startup record for the current user
      const { data: startupData, error: startupError } = await supabase
        .from('startups')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (startupError || !startupData) {
        toast({
          title: "Error",
          description: "Could not find your startup profile. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      // Check if already joined
      const { data: existingAttendee } = await supabase
        .from('pod_attendees')
        .select('id')
        .eq('pod_id', podId)
        .eq('startup_id', startupData.id)
        .single();

      if (existingAttendee) {
        toast({
          title: "Already Joined",
          description: "You have already joined this pod!",
        });
        return;
      }

      // Join the pod
      const { error: joinError } = await supabase
        .from('pod_attendees')
        .insert({
          pod_id: podId,
          startup_id: startupData.id
        });

      if (joinError) {
        console.error('Error joining pod:', joinError);
        toast({
          title: "Error",
          description: "Failed to join pod. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Pod Joined",
        description: "You have successfully joined the pod!",
      });
      
      // Refresh pods to update attendee count
      fetchPods();
    } catch (error) {
      console.error('Error joining pod:', error);
      toast({
        title: "Error",
        description: "Failed to join pod. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading pods...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Available Pods</h2>
        <p className="text-gray-600 mt-2">
          Join learning pods and connect with other startups and mentors
        </p>
      </div>

      {pods.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-orange-500 opacity-50" />
            <p className="text-muted-foreground">No pods available at the moment</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for new learning opportunities</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pods.map((pod) => (
            <Card key={pod.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pod.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Led by {pod.mentor_name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pod.mentor_type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{pod.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span>{new Date(pod.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>{pod.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span>{pod.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-orange-500" />
                    <span>{pod.current_attendees}/{pod.capacity} attendees</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleJoinPod(pod.id)}
                  disabled={pod.current_attendees >= pod.capacity}
                >
                  {pod.current_attendees >= pod.capacity ? 'Pod Full' : 'Join Pod'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewPods;
