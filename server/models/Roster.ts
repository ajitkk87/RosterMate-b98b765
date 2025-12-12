import { randomUUID } from 'crypto';
import { csvDb } from '../config/database';

export type DutyType = 'Prod Duty - Developer' | 'Non-Prod Duty - Developer' | 'Ops Duty' | 'Platform Duty';

export interface IDutyAssignment {
  _id: string;
  dutyType: DutyType;
  employeeId: string;
}

export interface IRoster {
  _id?: string;
  weekStartDate: string; // ISO string for CSV
  weekEndDate: string; // ISO string for CSV
  assignments: string; // JSON stringified array for CSV
  createdBy: string;
  createdAt: string; // ISO string for CSV
  updatedAt: string; // ISO string for CSV
}

class RosterModel {
  private collection = 'rosters';

  async create(data: Omit<IRoster, '_id' | 'createdAt' | 'updatedAt' | 'assignments'> & { assignments: IDutyAssignment[] }): Promise<IRoster> {
    const now = new Date().toISOString();
    const roster: IRoster = {
      _id: randomUUID(),
      weekStartDate: data.weekStartDate,
      weekEndDate: data.weekEndDate,
      assignments: JSON.stringify(data.assignments),
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    await csvDb.insertOne(this.collection, roster as any);
    return roster;
  }

  async findById(id: string): Promise<IRoster | null> {
    return (await csvDb.findById(this.collection, id)) as IRoster | null;
  }

  async find(filter?: Partial<IRoster>): Promise<IRoster[]> {
    return (await csvDb.find(this.collection, filter)) as IRoster[];
  }

  async findByWeekStartDate(weekStartDate: string): Promise<IRoster | null> {
    return (await csvDb.findOne(this.collection, { weekStartDate })) as IRoster | null;
  }

  async updateOne(id: string, update: Partial<IRoster> & { assignments?: IDutyAssignment[] }): Promise<IRoster | null> {
    const updateData: any = {
      ...update,
      updatedAt: new Date().toISOString(),
    };
    if (update.assignments) {
      updateData.assignments = JSON.stringify(update.assignments);
    }
    delete updateData.assignments;
    return (await csvDb.updateOne(this.collection, id, updateData)) as IRoster | null;
  }

  async deleteOne(id: string): Promise<boolean> {
    return csvDb.deleteOne(this.collection, id);
  }

  async countDocuments(filter?: Partial<IRoster>): Promise<number> {
    return csvDb.countDocuments(this.collection, filter);
  }
}

const Roster = new RosterModel();
export default Roster;
