import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Employee } from '@/types/employee';
import { DutyAssignment } from '@/types/roster';
import { getEmployees } from '@/api/employees';
import { useToast } from '@/hooks/useToast';

interface ReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: DutyAssignment | null;
  onReassign: (assignmentId: string, employeeId: string) => void;
}

export function ReassignDialog({ open, onOpenChange, assignment, onReassign }: ReassignDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAvailableEmployees = async () => {
    try {
      setLoading(true);
      const { employees } = await getEmployees();
      const filtered = employees.filter(
        (emp) =>
          emp.department === assignment?.employee.department &&
          emp._id !== assignment?.employee._id &&
          emp.status === 'Available'
      );
      setAvailableEmployees(filtered);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && assignment) {
      loadAvailableEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, assignment]);

  const handleReassign = () => {
    if (assignment && selectedEmployeeId) {
      onReassign(assignment._id, selectedEmployeeId);
      setSelectedEmployeeId('');
      onOpenChange(false);
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>Reassign Duty</DialogTitle>
          <DialogDescription>
            Reassign {assignment.dutyType} from {assignment.employee.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Assignee</label>
            <div className="rounded-md border bg-muted p-3">
              <p className="font-medium">{assignment.employee.name}</p>
              <p className="text-sm text-muted-foreground">{assignment.employee.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Assignee</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {availableEmployees.length === 0 && !loading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No available employees found in the {assignment.employee.department} department.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReassign} disabled={!selectedEmployeeId}>
            Confirm Reassignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}