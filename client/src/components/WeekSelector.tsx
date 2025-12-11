import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';

interface WeekSelectorProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

export function WeekSelector({ currentWeek, onWeekChange }: WeekSelectorProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addWeeks(weekStart, 1);

  const handlePrevious = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const handleNext = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    onWeekChange(new Date());
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <Button variant="outline" size="icon" onClick={handlePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Week of</p>
          <p className="text-lg font-semibold">
            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Today
        </Button>
      </div>
      <Button variant="outline" size="icon" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}