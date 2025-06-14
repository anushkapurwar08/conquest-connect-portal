
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Coach {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

interface Startup {
  id: string;
  startup_name: string;
}

interface Assignment {
  id: string;
  coach_id: string;
  startup_id: string;
  assigned_at: string;
  is_active: boolean;
  mentors: {
    profiles: {
      first_name: string;
      last_name: string;
      username: string;
    };
  };
  startups: {
    startup_name: string;
  };
}

const CoachAssignmentManager: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [selectedStartup, setSelectedStartup] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch coaches
      const { data: coachData, error: coachError } = await supabase
        .from('mentors')
        .select(`
          id,
          profiles!inner(first_name, last_name, username)
        `)
        .eq('mentor_type', 'coach');

      if (coachError) throw coachError;

      // Fetch startups
      const { data: startupData, error: startupError } = await supabase
        .from('startups')
        .select('id, startup_name')
        .order('startup_name');

      if (startupError) throw startupError;

      // Fetch assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('coach_startup_assignments')
        .select(`
          id,
          coach_id,
          startup_id,
          assigned_at,
          is_active,
          mentors!inner(
            profiles!inner(first_name, last_name, username)
          ),
          startups!inner(startup_name)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (assignmentError) throw assignmentError;

      setCoaches(coachData || []);
      setStartups(startupData || []);
      setAssignments(assignmentData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignment data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    if (!selectedCoach || !selectedStartup) {
      toast({
        title: "Error",
        description: "Please select both a coach and a startup.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('coach_startup_assignments')
        .insert({
          coach_id: selectedCoach,
          startup_id: selectedStartup,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coach assignment created successfully."
      });

      setSelectedCoach('');
      setSelectedStartup('');
      fetchData();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment.",
        variant: "destructive"
      });
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('coach_startup_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coach assignment removed successfully."
      });

      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove assignment.",
        variant: "destructive"
      });
    }
  };

  const getCoachAssignmentCount = (coachId: string) => {
    return assignments.filter(a => a.coach_id === coachId && a.is_active).length;
  };

  const getAssignedStartupIds = () => {
    return assignments.filter(a => a.is_active).map(a => a.startup_id);
  };

  const getCoachName = (coach: Coach) => {
    if (coach.profiles.first_name && coach.profiles.last_name) {
      return `${coach.profiles.first_name} ${coach.profiles.last_name}`;
    }
    return coach.profiles.username;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <UserPlus className="h-5 w-5" />
            <span>Create Coach Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Select Coach</label>
              <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a coach..." />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map((coach) => {
                    const assignmentCount = getCoachAssignmentCount(coach.id);
                    const canAssign = assignmentCount < 2;
                    
                    return (
                      <SelectItem 
                        key={coach.id} 
                        value={coach.id}
                        disabled={!canAssign}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{getCoachName(coach)}</span>
                          <Badge variant={canAssign ? 'default' : 'destructive'} className="ml-2">
                            {assignmentCount}/2
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Select Startup</label>
              <Select value={selectedStartup} onValueChange={setSelectedStartup}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a startup..." />
                </SelectTrigger>
                <SelectContent>
                  {startups
                    .filter(startup => !getAssignedStartupIds().includes(startup.id))
                    .map((startup) => (
                      <SelectItem key={startup.id} value={startup.id}>
                        {startup.startup_name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={createAssignment}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Create Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <Users className="h-5 w-5" />
            <span>Current Coach Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active coach assignments found.
              </p>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium">
                        {assignment.mentors?.profiles?.first_name && assignment.mentors?.profiles?.last_name
                          ? `${assignment.mentors.profiles.first_name} ${assignment.mentors.profiles.last_name}`
                          : assignment.mentors?.profiles?.username || 'Unknown Coach'}
                      </div>
                      <div className="text-sm text-muted-foreground">Coach</div>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div>
                      <div className="font-medium">{assignment.startups?.startup_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAssignment(assignment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachAssignmentManager;
