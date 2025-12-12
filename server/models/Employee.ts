import { randomUUID } from 'crypto';
import { csvDb } from '../config/database';

export type Department = 'Developer' | 'Ops' | 'Platform';
export type EmployeeStatus = 'Available' | 'On Holiday' | 'On Duty';

export interface IEmployee {
  _id?: string;
  name: string;
  email: string;
  department: Department;
  employeeId: string;
  status: EmployeeStatus;
  photoUrl?: string;
  lastDutyDate?: string; // ISO string for CSV
  createdAt: string; // ISO string for CSV
  updatedAt: string; // ISO string for CSV
}

class EmployeeModel {
  private collection = 'employees';

  async create(data: Omit<IEmployee, '_id' | 'createdAt' | 'updatedAt'>): Promise<IEmployee> {
    const now = new Date().toISOString();
    const employee: IEmployee = {
      _id: randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await csvDb.insertOne(this.collection, employee as any);
    return employee;
  }

  async findById(id: string): Promise<IEmployee | null> {
    return (await csvDb.findById(this.collection, id)) as IEmployee | null;
  }

  async find(filter?: Partial<IEmployee>): Promise<IEmployee[]> {
    return (await csvDb.find(this.collection, filter)) as IEmployee[];
  }

  async findByEmail(email: string): Promise<IEmployee | null> {
    return (await csvDb.findOne(this.collection, { email })) as IEmployee | null;
  }

  async findByEmployeeId(employeeId: string): Promise<IEmployee | null> {
    return (await csvDb.findOne(this.collection, { employeeId })) as IEmployee | null;
  }

  async updateOne(id: string, update: Partial<IEmployee>): Promise<IEmployee | null> {
    const updateWithTimestamp = {
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return (await csvDb.updateOne(this.collection, id, updateWithTimestamp as any)) as IEmployee | null;
  }

  async deleteOne(id: string): Promise<boolean> {
    return csvDb.deleteOne(this.collection, id);
  }

  async countDocuments(filter?: Partial<IEmployee>): Promise<number> {
    return csvDb.countDocuments(this.collection, filter);
  }
}

const Employee = new EmployeeModel();
export default Employee;
