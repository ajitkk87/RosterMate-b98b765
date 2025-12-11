export type Department = 'Developer' | 'Ops' | 'Platform';

export interface Employee {
  _id: string;
  name: string;
  email: string;
  department: Department;
  employeeId: string;
  status: 'Available' | 'On Holiday' | 'On Duty';
  photoUrl?: string;
}