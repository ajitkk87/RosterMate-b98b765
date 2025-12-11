import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { getMockUser } from '@/api/mockUser';
import { getRosterByWeek, generateRoster, reassignDuty } from '@/api/roster';
import { WeeklyRoster } from '@/types/roster';
import { format, startOfWeek } from 'date-fns';
import { WeekSelector } from '@/components/WeekSelector';
import { DutyCard } from '@/components/DutyCard';
import { ReassignDialog } from '@/components/ReassignDialog';
import { DutyAssignment } from '@/types/roster';

export function Roster() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [roster, setRoster] = useState<WeeklyRoster | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<DutyAssignment | null>(null);
  const { toast } = useToast();
  const user = getMockUser();

  const isAdmin = user?.role === 'admin';

  const loadRoster = async () => {
    try {
      setLoading(true);
      const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      console.log('Loading roster for week:', weekStart);
      const { roster: data } = await getRosterByWeek(weekStart);
      setRoster(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Error loading roster:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoster = async () => {
    try {
      setGenerating(true);
      const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      console.log('Generating roster for week:', weekStart);
      const { roster: data, message } = await generateRoster(weekStart);
      setRoster(data);
      toast({
        title: 'Success',
        description: message,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Error generating roster:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const handleReassignClick = (assignmentId: string) => {
    const assignment = roster?.assignments.find((a) => a._id === assignmentId);
    if (assignment) {
      setSelectedAssignment(assignment);
      setReassignDialogOpen(true);
    }
  };

  const handleReassign = async (assignmentId: string, employeeId: string) => {
    try {
      console.log('Reassigning duty:', assignmentId, 'to employee:', employeeId);
      await reassignDuty(assignmentId, employeeId);
      toast({
        title: 'Success',
        description: 'Duty reassigned successfully',
      });
      loadRoster();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Error reassigning duty:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Roster</h1>
          <p className="text-muted-foreground">View and manage duty assignments</p>
        </div>
        {isAdmin && (
          <Button onClick={handleGenerateRoster} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {roster ? 'Regenerate Roster' : 'Generate Roster'}
              </>
            )}
          </Button>
        )}
      </div>

      <WeekSelector currentWeek={currentWeek} onWeekChange={setCurrentWeek} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : roster ? (
        <Card>
          <CardHeader>
            <CardTitle>Duty Assignments</CardTitle>
            <CardDescription>
              Week of {format(new Date(roster.weekStartDate), 'MMM dd')} -{' '}
              {format(new Date(roster.weekEndDate), 'MMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roster.assignments.map((assignment) => (
                <DutyCard
                  key={assignment._id}
                  assignment={assignment}
                  onReassign={isAdmin ? handleReassignClick : undefined}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No roster generated for this week</p>
            {isAdmin && (
              <Button onClick={handleGenerateRoster}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Roster
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ReassignDialog
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
        assignment={selectedAssignment}
        onReassign={handleReassign}
      />
    </div>
  );
}