import { Employee } from './employee';

export type DutyType = 'Prod Duty - Developer' | 'Non-Prod Duty - Developer' | 'Ops Duty' | 'Platform Duty';

export interface DutyAssignment {
  _id: string;
  dutyType: DutyType;
  employee: Employee;
}

export interface WeeklyRoster {
  _id: string;
  weekStartDate: string;
  weekEndDate: string;
  assignments: DutyAssignment[];
  createdAt: string;
  createdBy: string;
}