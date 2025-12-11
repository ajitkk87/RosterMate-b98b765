import { useEffect, useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { getRosterHistory } from '@/api/roster';
import { WeeklyRoster } from '@/types/roster';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DutyCard } from '@/components/DutyCard';

export function RosterHistory() {
  const [rosters, setRosters] = useState<WeeklyRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoster, setSelectedRoster] = useState<WeeklyRoster | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRosterHistory();
  }, []);

  const loadRosterHistory = async () => {
    try {
      setLoading(true);
      console.log('Loading roster history');
      const { rosters: data } = await getRosterHistory();
      setRosters(data);
    } catch (error: any) {
      console.error('Error loading roster history:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (roster: WeeklyRoster) => {
    setSelectedRoster(roster);
    setDialogOpen(true);
  };

  const getDepartmentCounts = (roster: WeeklyRoster) => {
    const counts = {
      Developer: 0,
      Ops: 0,
      Platform: 0,
    };

    roster.assignments.forEach((assignment) => {
      counts[assignment.employee.department]++;
    });

    return counts;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roster History</h1>
        <p className="text-muted-foreground">View past duty assignments</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : rosters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No roster history available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rosters.map((roster) => {
            const counts = getDepartmentCounts(roster);
            return (
              <Card key={roster._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Week of {format(new Date(roster.weekStartDate), 'MMM dd')} -{' '}
                        {format(new Date(roster.weekEndDate), 'MMM dd, yyyy')}
                      </CardTitle>
                      <CardDescription>
                        Generated on {format(new Date(roster.createdAt), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" onClick={() => handleViewDetails(roster)}>
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      {counts.Developer} Developers
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">
                      {counts.Ops} Ops
                    </Badge>
                    <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300">
                      {counts.Platform} Platform
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl bg-background max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Roster Details</DialogTitle>
            {selectedRoster && (
              <DialogDescription>
                Week of {format(new Date(selectedRoster.weekStartDate), 'MMM dd')} -{' '}
                {format(new Date(selectedRoster.weekEndDate), 'MMM dd, yyyy')}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedRoster && (
            <div className="grid gap-4 md:grid-cols-2 py-4">
              {selectedRoster.assignments.map((assignment) => (
                <DutyCard key={assignment._id} assignment={assignment} />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}