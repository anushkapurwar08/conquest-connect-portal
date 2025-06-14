
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Building, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PodMember {
  id: string;
  name: string;
  industry?: string;
  stage?: string;
  description?: string;
}

interface PodCall {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
}

const PodView: React.FC = () => {
  const { profile } = useAuth();
  const [podMembers, setPodMembers] = useState<PodMember[]>([]);
  const [cohortStartups, setCohortStartups] = useState<PodMember[]>([]);
  const [podCalls, setPodCalls] = useState<PodCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'pod' | 'cohort'>('pod');

  useEffect(() => {
    if (profile?.id) {
      fetchPodData();
    }
  }, [profile?.id]);

  const fetchPodData = async () => {
    try {
      setLoading(true);

      // Get current startup's pod (for now, we'll simulate pod membership)
      // In a real app, you'd have a pods table that groups startups
      const { data: currentStartup } = await supabase
        .from('startups')
        .select('id, startup_name, industry, stage, description')
        .eq('profile_id', profile?.id)
        .single();

      if (!currentStartup) {
        setLoading(false);
        return;
      }

      // Simulate pod members (startups in the same industry or stage)
      const { data: podStartups } = await supabase
        .from('startups')
        .select('id, startup_name, industry, stage, description')
        .or(`industry.eq.${currentStartup.industry},stage.eq.${currentStartup.stage}`)
        .neq('id', currentStartup.id)
        .limit(5);

      if (podStartups) {
        const formattedPodMembers = podStartups.map(startup => ({
          id: startup.id,
          name: startup.startup_name,
          industry: startup.industry,
          stage: startup.stage,
          description: startup.description || 'No description available'
        }));
        setPodMembers(formattedPodMembers);
      }

      // Fetch all cohort startups
      const { data: allStartups } = await supabase
        .from('startups')
        .select('id, startup_name, industry, stage, description')
        .neq('id', currentStartup.id);

      if (allStartups) {
        const formattedCohortMembers = allStartups.map(startup => ({
          id: startup.id,
          name: startup.startup_name,
          industry: startup.industry,
          stage: startup.stage,
          description: startup.description || 'No description available'
        }));
        setCohortStartups(formattedCohortMembers);
      }

      // Fetch weekly pod calls (simulate weekly recurring calls)
      const now = new Date();
      const upcomingCalls = [];
      for (let i = 0; i < 4; i++) {
        const callDate = new Date(now);
        callDate.setDate(now.getDate() + (i * 7) + (7 - now.getDay())); // Next Monday
        callDate.setHours(14, 0, 0, 0); // 2 PM

        upcomingCalls.push({
          id: `pod-call-${i}`,
          title: 'Weekly Pod Check-in',
          scheduled_at: callDate.toISOString(),
          status: 'scheduled'
        });
      }
      setPodCalls(upcomingCalls);

    } catch (error) {
      console.error('Error fetching pod data:', error);
      toast({
        title: "Error",
        description: "Failed to load pod information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading pod information...</p>
        </CardContent>
      </Card>
    );
  }

  const currentData = viewMode === 'pod' ? podMembers : cohortStartups;

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {viewMode === 'pod' ? 'My Pod' : 'Full Cohort'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'pod' 
              ? 'Your pod members and weekly calls' 
              : 'All startups in the current cohort'
            }
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setViewMode(viewMode === 'pod' ? 'cohort' : 'pod')}
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          <Eye className="h-4 w-4 mr-2" />
          {viewMode === 'pod' ? 'View Full Cohort' : 'View My Pod'}
        </Button>
      </div>

      {/* Weekly Pod Calls (only show for pod view) */}
      {viewMode === 'pod' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span>Weekly Pod Calls</span>
            </CardTitle>
            <CardDescription>
              Regular check-ins with your pod members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {podCalls.map((call) => {
                const callDate = new Date(call.scheduled_at);
                const isUpcoming = callDate > new Date();

                return (
                  <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="font-medium">{call.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {callDate.toLocaleDateString()} at {callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isUpcoming ? "default" : "secondary"}>
                      {isUpcoming ? 'Upcoming' : 'Past'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pod/Cohort Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-orange-500" />
            <span>{viewMode === 'pod' ? 'Pod Members' : 'Cohort Startups'}</span>
          </CardTitle>
          <CardDescription>
            {viewMode === 'pod' 
              ? 'Startups in your pod group' 
              : 'All startups in the current cohort'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {viewMode === 'pod' ? 'pod members' : 'cohort startups'} found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {currentData.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                      <AvatarImage src="/placeholder.svg" />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{member.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {member.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {member.industry && (
                          <Badge variant="secondary" className="text-xs">
                            {member.industry}
                          </Badge>
                        )}
                        {member.stage && (
                          <Badge variant="outline" className="text-xs">
                            {member.stage}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PodView;
