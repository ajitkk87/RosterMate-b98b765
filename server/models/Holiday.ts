import { randomUUID } from 'crypto';
import { csvDb } from '../config/database';

export type HolidayStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IHoliday {
  _id?: string;
  employeeId: string;
  startDate: string; // ISO string for CSV
  endDate: string; // ISO string for CSV
  days: number;
  notes?: string;
  status: HolidayStatus;
  createdAt: string; // ISO string for CSV
  updatedAt: string; // ISO string for CSV
}

class HolidayModel {
  private collection = 'holidays';

  async create(data: Omit<IHoliday, '_id' | 'createdAt' | 'updatedAt'>): Promise<IHoliday> {
    const now = new Date().toISOString();
    const holiday: IHoliday = {
      _id: randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await csvDb.insertOne(this.collection, holiday as any);
    return holiday;
  }

  async findById(id: string): Promise<IHoliday | null> {
    return (await csvDb.findById(this.collection, id)) as IHoliday | null;
  }

  async find(filter?: Partial<IHoliday>): Promise<IHoliday[]> {
    return (await csvDb.find(this.collection, filter)) as IHoliday[];
  }

  async findByEmployeeId(employeeId: string): Promise<IHoliday[]> {
    return (await csvDb.find(this.collection, { employeeId })) as IHoliday[];
  }

  async findByStatus(status: HolidayStatus): Promise<IHoliday[]> {
    return (await csvDb.find(this.collection, { status })) as IHoliday[];
  }

  async updateOne(id: string, update: Partial<IHoliday>): Promise<IHoliday | null> {
    const updateWithTimestamp = {
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return (await csvDb.updateOne(this.collection, id, updateWithTimestamp as any)) as IHoliday | null;
  }

  async deleteOne(id: string): Promise<boolean> {
    return csvDb.deleteOne(this.collection, id);
  }

  async countDocuments(filter?: Partial<IHoliday>): Promise<number> {
    return csvDb.countDocuments(this.collection, filter);
  }
}

const Holiday = new HolidayModel();
export default Holiday;
