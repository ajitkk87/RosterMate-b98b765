import Holiday, { IHoliday, HolidayStatus } from '../models/Holiday';
import Employee from '../models/Employee';
import employeeService from './employeeService';

class HolidayService {
  /**
   * Get all holidays, optionally filtered by status or employee
   */
  async getAllHolidays(filters?: {
    status?: HolidayStatus;
    employeeId?: string;
  }): Promise<IHoliday[]> {
    const query: Partial<IHoliday> = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.employeeId) query.employeeId = filters.employeeId;

    const holidays = await Holiday.find(query);
    // populate employee and sort by createdAt desc
    const populated = await Promise.all(
      holidays.map(async h => {
        const emp = await employeeService.getEmployeeById(h.employeeId);
        return { ...h, employeeId: emp as any } as any;
      })
    );

    return populated.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  /**
   * Get holidays for a specific employee
   */
  async getEmployeeHolidays(employeeId: string): Promise<IHoliday[]> {
    if (!employeeId) {
      throw new Error('Invalid employee ID format');
    }

    const holidays = await Holiday.findByEmployeeId(employeeId);
    const populated = await Promise.all(
      holidays.map(async h => ({ ...h, employeeId: await employeeService.getEmployeeById(h.employeeId) } as any))
    );

    return populated.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }

  /**
   * Request a new holiday
   */
  async requestHoliday(data: {
    employeeId: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<IHoliday> {
    if (!data.employeeId) {
      throw new Error('Invalid employee ID format');
    }

    const employee = await employeeService.getEmployeeById(data.employeeId);
    if (!employee) throw new Error('Employee not found');

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate < new Date()) throw new Error('Start date cannot be in the past');
    if (endDate < startDate) throw new Error('End date must be after or equal to start date');

    const existing = await Holiday.findByEmployeeId(data.employeeId);
    const overlapping = existing.find(h => {
      if (!['Pending', 'Approved'].includes(h.status)) return false;
      const hs = new Date(h.startDate);
      const he = new Date(h.endDate);
      return !(endDate < hs || startDate > he);
    });

    if (overlapping) throw new Error('This holiday overlaps with an existing holiday request');

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const holiday = await Holiday.create({
      employeeId: data.employeeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      days,
      notes: data.notes,
      status: 'Pending',
    });

    return { ...holiday, employeeId: await employeeService.getEmployeeById(holiday.employeeId) } as any;
  }

  /**
   * Approve a holiday request
   */
  async approveHoliday(id: string): Promise<IHoliday | null> {
    if (!id) throw new Error('Invalid holiday ID format');

    const holiday = await Holiday.findById(id);
    if (!holiday) throw new Error('Holiday not found');
    if (holiday.status !== 'Pending') throw new Error('Only pending holidays can be approved');

    await Holiday.updateOne(id, { status: 'Approved' } as any);

    const now = new Date();
    const hs = new Date(holiday.startDate);
    const he = new Date(holiday.endDate);
    if (hs <= now && he >= now) {
      await employeeService.updateEmployeeStatus(holiday.employeeId, 'On Holiday');
    }

    const updated = await Holiday.findById(id);
    return { ...updated, employeeId: await employeeService.getEmployeeById(updated!.employeeId) } as any;
  }

  /**
   * Reject a holiday request
   */
  async rejectHoliday(id: string): Promise<IHoliday | null> {
    if (!id) throw new Error('Invalid holiday ID format');

    const holiday = await Holiday.findById(id);
    if (!holiday) throw new Error('Holiday not found');
    if (holiday.status !== 'Pending') throw new Error('Only pending holidays can be rejected');

    await Holiday.updateOne(id, { status: 'Rejected' } as any);
    const updated = await Holiday.findById(id);
    return { ...updated, employeeId: await employeeService.getEmployeeById(updated!.employeeId) } as any;
  }

  /**
   * Get employee holiday balance (assuming 25 days per year)
   */
  async getEmployeeHolidayBalance(employeeId: string): Promise<number> {
    if (!employeeId) throw new Error('Invalid employee ID format');

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const all = await Holiday.findByEmployeeId(employeeId);
    const approved = all.filter(h => h.status === 'Approved');
    const inYear = approved.filter(h => {
      const sd = new Date(h.startDate);
      return sd >= yearStart && sd <= yearEnd;
    });

    const usedDays = inYear.reduce((sum, holiday) => sum + holiday.days, 0);
    const totalAllowance = 25;
    return Math.max(0, totalAllowance - usedDays);
  }

  /**
   * Check if employee is on holiday during a specific date range
   */
  async isEmployeeOnHoliday(employeeId: string, startDate: Date, endDate: Date): Promise<boolean> {
    if (!employeeId) throw new Error('Invalid employee ID format');

    const all = await Holiday.findByEmployeeId(employeeId);
    const active = all.find(h => {
      if (h.status !== 'Approved') return false;
      const hs = new Date(h.startDate);
      const he = new Date(h.endDate);
      return !(endDate < hs || startDate > he);
    });
    return !!active;
  }

  /**
   * Update employee statuses based on current holidays
   */
  async updateEmployeeHolidayStatuses(): Promise<void> {
    const now = new Date();
    const allApproved = await Holiday.find({ status: 'Approved' });

    const active = allApproved.filter(h => {
      const hs = new Date(h.startDate);
      const he = new Date(h.endDate);
      return hs <= now && he >= now;
    });

    for (const holiday of active) {
      await employeeService.updateEmployeeStatus(holiday.employeeId, 'On Holiday');
    }

    const ended = allApproved.filter(h => new Date(h.endDate) < now);
    for (const holiday of ended) {
      const emp = await employeeService.getEmployeeById(holiday.employeeId);
      if (emp && emp.status === 'On Holiday') {
        await employeeService.updateEmployeeStatus(emp._id as string, 'Available');
      }
    }
  }
}

export default new HolidayService();
