import { Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DutyAssignment } from '@/types/roster';
import { cn } from '@/lib/utils';

interface DutyCardProps {
  assignment: DutyAssignment;
  onReassign?: (assignmentId: string) => void;
  isAdmin?: boolean;
}

const dutyColors = {
  'Prod Duty - Developer': 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
  'Non-Prod Duty - Developer': 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/50',
  'Ops Duty': 'from-green-500/20 to-green-600/20 border-green-500/50',
  'Platform Duty': 'from-orange-500/20 to-orange-600/20 border-orange-500/50',
};

const badgeColors = {
  'Prod Duty - Developer': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  'Non-Prod Duty - Developer': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  'Ops Duty': 'bg-green-500/20 text-green-700 dark:text-green-300',
  'Platform Duty': 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
};

export function DutyCard({ assignment, onReassign, isAdmin }: DutyCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-lg',
        'bg-gradient-to-br',
        dutyColors[assignment.dutyType]
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{assignment.dutyType}</CardTitle>
          <Badge className={cn('font-medium', badgeColors[assignment.dutyType])}>
            {assignment.employee.department}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{assignment.employee.name}</p>
            <p className="text-sm text-muted-foreground">{assignment.employee.employeeId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${assignment.employee.email}`} className="hover:underline">
            {assignment.employee.email}
          </a>
        </div>
        {isAdmin && onReassign && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onReassign(assignment._id)}
          >
            Reassign
          </Button>
        )}
      </CardContent>
    </Card>
  );
}