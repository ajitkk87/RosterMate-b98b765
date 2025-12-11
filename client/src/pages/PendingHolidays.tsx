import { useEffect, useState } from 'react';
import { Check, X, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { getHolidays, approveHoliday, rejectHoliday } from '@/api/holidays';
import { Holiday, HolidayStatus } from '@/types/holiday';
import { format } from 'date-fns';

export function PendingHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HolidayStatus | 'all'>('Pending');
  const { toast } = useToast();

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      console.log('Loading all holidays for admin');
      const { holidays: data } = await getHolidays();
      setHolidays(data);
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

  const handleApprove = async (id: string) => {
    try {
      console.log('Approving holiday:', id);
      await approveHoliday(id);
      toast({
        title: 'Success',
        description: 'Holiday request approved',
      });
      loadHolidays();
    } catch (error: any) {
      console.error('Error approving holiday:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      console.log('Rejecting holiday:', id);
      await rejectHoliday(id);
      toast({
        title: 'Success',
        description: 'Holiday request rejected',
      });
      loadHolidays();
    } catch (error: any) {
      console.error('Error rejecting holiday:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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

  const pendingCount = holidays.filter((h) => h.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Holiday Requests</h1>
          <p className="text-muted-foreground">Review and manage employee holiday requests</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Holiday Requests</CardTitle>
          <CardDescription>Filter and manage holiday requests by status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as HolidayStatus | 'all')}>
            <TabsList className="mb-4">
              <TabsTrigger value="Pending">
                Pending
                {pendingCount > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="Approved">Approved</TabsTrigger>
              <TabsTrigger value="Rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : filteredHolidays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No holiday requests found</p>
                </div>
              ) : (
                filteredHolidays.map((holiday) => (
                  <Card key={holiday._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{holiday.employeeName}</h3>
                            <Badge variant="outline">{holiday.department}</Badge>
                            {getStatusBadge(holiday.status)}
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
                            <div className="rounded-md bg-muted p-3">
                              <p className="text-sm">{holiday.notes}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Requested on {format(new Date(holiday.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {holiday.status === 'Pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(holiday._id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(holiday._id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
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