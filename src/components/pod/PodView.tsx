
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
  startup_name: string;
  industry?: string;
  stage?: string;
  description?: string;
  profile_id: string;
  founder_name?: string;
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
  const [currentStartup, setCurrentStartup] = useState<PodMember | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchPodData();
    }
  }, [profile?.id]);

  const fetchPodData = async () => {
    try {
      setLoading(true);

      // Get current startup
      const { data: startup } = await supabase
        .from('startups')
        .select(`
          id,
          startup_name,
          industry,
          stage,
          description,
          profile_id
        `)
        .eq('profile_id', profile?.id)
        .single();

      if (!startup) {
        setLoading(false);
        return;
      }

      setCurrentStartup(startup);

      // Get pod members (startups in the same industry and stage)
      const { data: podStartups } = await supabase
        .from('startups')
        .select(`
          id,
          startup_name,
          industry,
          stage,
          description,
          profile_id,
          profiles!inner(
            first_name,
            last_name,
            username
          )
        `)
        .eq('industry', startup.industry)
        .eq('stage', startup.stage)
        .neq('id', startup.id);

      if (podStartups) {
        const formattedPodMembers = podStartups.map((s: any) => ({
          id: s.id,
          startup_name: s.startup_name,
          industry: s.industry,
          stage: s.stage,
          description: s.description || 'No description available',
          profile_id: s.profile_id,
          founder_name: s.profiles.first_name && s.profiles.last_name
            ? `${s.profiles.first_name} ${s.profiles.last_name}`
            : s.profiles.username
        }));
        setPodMembers(formattedPodMembers);
      }

      // Get all cohort startups
      const { data: allStartups } = await supabase
        .from('startups')
        .select(`
          id,
          startup_name,
          industry,
          stage,
          description,
          profile_id,
          profiles!inner(
            first_name,
            last_name,
            username
          )
        `)
        .neq('id', startup.id);

      if (allStartups) {
        const formattedCohortMembers = allStartups.map((s: any) => ({
          id: s.id,
          startup_name: s.startup_name,
          industry: s.industry,
          stage: s.stage,
          description: s.description || 'No description available',
          profile_id: s.profile_id,
          founder_name: s.profiles.first_name && s.profiles.last_name
            ? `${s.profiles.first_name} ${s.profiles.last_name}`
            : s.profiles.username
        }));
        setCohortStartups(formattedCohortMembers);
      }

      // Fetch actual pod calls from appointments table (for pod members only)
      if (podStartups && podStartups.length > 0) {
        const podStartupIds = podStartups.map((s: any) => s.id);
        const { data: calls } = await supabase
          .from('appointments')
          .select(`
            id,
            title,
            scheduled_at,
            status
          `)
          .in('startup_id', [...podStartupIds, startup.id])
          .eq('title', 'Pod Call')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5);

        if (calls) {
          setPodCalls(calls);
        } else {
          // Create sample weekly pod calls if none exist
          const upcomingCalls = [];
          const now = new Date();
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
        }
      }

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
              ? `Startups in the ${currentStartup?.industry} industry at ${currentStartup?.stage} stage`
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
              <span>Pod Calls</span>
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
              {viewMode === 'pod' && (
                <p className="text-sm">Pod members are grouped by industry and stage</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {currentData.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {member.startup_name.charAt(0)}
                      </AvatarFallback>
                      <AvatarImage src="/placeholder.svg" />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{member.startup_name}</h4>
                      {member.founder_name && (
                        <p className="text-xs text-muted-foreground">by {member.founder_name}</p>
                      )}
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
