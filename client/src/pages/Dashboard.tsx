import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Umbrella, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { getRosterByWeek } from '@/api/roster';
import { getHolidays, getMyHolidays } from '@/api/holidays';
import { format, startOfWeek } from 'date-fns';
import { WeeklyRoster } from '@/types/roster';
import { Holiday } from '@/types/holiday';
import { DutyCard } from '@/components/DutyCard';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentRoster, setCurrentRoster] = useState<WeeklyRoster | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayBalance, setHolidayBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const rosterResponse = await getRosterByWeek(weekStart);
      setCurrentRoster(rosterResponse.roster);

      if (isAdmin) {
        const holidaysResponse = await getHolidays();
        setHolidays(holidaysResponse.holidays.filter((h) => h.status === 'Pending'));
      } else {
        const myHolidaysResponse = await getMyHolidays();
        setHolidays(myHolidaysResponse.holidays);
        setHolidayBalance(myHolidaysResponse.balance);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const myNextDuty = currentRoster?.assignments.find(
    (a) => a.employee._id === user?._id || a.employee.email === user?.email
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Manage your team roster and holidays' : 'View your duties and holidays'}
        </p>
      </div>

      {isAdmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Week Roster</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentRoster ? 'Generated' : 'Not Generated'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentRoster
                    ? `${currentRoster.assignments.length} assignments`
                    : 'Generate roster for this week'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Umbrella className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{holidays.length}</div>
                <p className="text-xs text-muted-foreground">Holiday requests awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">30</div>
                <p className="text-xs text-muted-foreground">Across 3 departments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your roster and team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/roster')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {currentRoster ? 'View Current Roster' : 'Generate This Week\'s Roster'}
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/holidays/pending')}
                >
                  <Umbrella className="mr-2 h-4 w-4" />
                  Review Holiday Requests
                  {holidays.length > 0 && (
                    <Badge className="ml-auto" variant="secondary">
                      {holidays.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/employees')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Employees
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Holiday Requests</CardTitle>
                <CardDescription>Requests awaiting your approval</CardDescription>
              </CardHeader>
              <CardContent>
                {holidays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {holidays.slice(0, 3).map((holiday) => (
                      <div
                        key={holiday._id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{holiday.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(holiday.startDate), 'MMM dd')} -{' '}
                            {format(new Date(holiday.endDate), 'MMM dd')}
                          </p>
                        </div>
                        <Badge>{holiday.days} days</Badge>
                      </div>
                    ))}
                    {holidays.length > 3 && (
                      <Button
                        variant="link"
                        className="w-full"
                        onClick={() => navigate('/holidays/pending')}
                      >
                        View all {holidays.length} requests
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Duty</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myNextDuty ? myNextDuty.dutyType.split(' - ')[0] : 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {myNextDuty ? 'This week' : 'No upcoming duties'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Holiday Balance</CardTitle>
                <Umbrella className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{holidayBalance} days</div>
                <p className="text-xs text-muted-foreground">Remaining this year</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Holidays</CardTitle>
                <Umbrella className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {holidays.filter((h) => h.status === 'Approved').length}
                </div>
                <p className="text-xs text-muted-foreground">Approved holidays</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {myNextDuty && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Next Duty</CardTitle>
                  <CardDescription>You are assigned for this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <DutyCard assignment={myNextDuty} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your holidays and view roster</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/holidays/request')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Request Holiday
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/holidays')}
                >
                  <Umbrella className="mr-2 h-4 w-4" />
                  View My Holidays
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/roster')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Current Roster
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {currentRoster && (
        <Card>
          <CardHeader>
            <CardTitle>Current Week Roster</CardTitle>
            <CardDescription>
              Week of {format(new Date(currentRoster.weekStartDate), 'MMM dd')} -{' '}
              {format(new Date(currentRoster.weekEndDate), 'MMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentRoster.assignments.map((assignment) => (
                <DutyCard key={assignment._id} assignment={assignment} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}