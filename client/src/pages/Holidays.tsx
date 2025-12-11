import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { getHolidays, getMyHolidays } from '@/api/holidays';
import { Holiday, HolidayStatus } from '@/types/holiday';
import { format } from 'date-fns';

export function Holidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayBalance, setHolidayBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HolidayStatus | 'all'>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      console.log('Loading holidays');
      if (isAdmin) {
        const { holidays: data } = await getHolidays();
        setHolidays(data);
      } else {
        const { holidays: data, balance } = await getMyHolidays();
        setHolidays(data);
        setHolidayBalance(balance);
      }
    } catch (error: any) {
      console.error('Error loading holidays:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: HolidayStatus) => {
    const variants: Record<HolidayStatus, string> = {
      Pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      Approved: 'bg-green-500/20 text-green-700 dark:text-green-300',
      Rejected: 'bg-red-500/20 text-red-700 dark:text-red-300',
    };

    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const filteredHolidays =
    activeTab === 'all' ? holidays : holidays.filter((h) => h.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? 'All Holidays' : 'My Holidays'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'View all employee holidays' : 'View your holiday requests and balance'}
          </p>
        </div>
      </div>

      {!isAdmin && (
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader>
            <CardTitle>Holiday Balance</CardTitle>
            <CardDescription>Your remaining holiday days this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{holidayBalance} days</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Holiday Requests</CardTitle>
          <CardDescription>
            {isAdmin ? 'All employee holiday requests' : 'Your holiday request history'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as HolidayStatus | 'all')}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Approved">Approved</TabsTrigger>
              <TabsTrigger value="Rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : filteredHolidays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No holidays found</p>
                </div>
              ) : (
                filteredHolidays.map((holiday) => (
                  <Card key={holiday._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{holiday.employeeName}</h3>
                            {isAdmin && (
                              <Badge variant="outline">{holiday.department}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {format(new Date(holiday.startDate), 'MMM dd, yyyy')} -{' '}
                              {format(new Date(holiday.endDate), 'MMM dd, yyyy')}
                            </span>
                            <Badge variant="secondary">{holiday.days} days</Badge>
                          </div>
                          {holiday.notes && (
                            <p className="text-sm text-muted-foreground">{holiday.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Requested on {format(new Date(holiday.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {getStatusBadge(holiday.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}