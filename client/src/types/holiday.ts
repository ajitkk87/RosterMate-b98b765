export type HolidayStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Holiday {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  days: number;
  notes?: string;
  status: HolidayStatus;
  createdAt: string;
}