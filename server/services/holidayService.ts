import Holiday, { IHoliday, HolidayStatus } from '../models/Holiday';
import Employee from '../models/Employee';
import employeeService from './employeeService';
import mongoose from 'mongoose';

class HolidayService {
  /**
   * Get all holidays, optionally filtered by status or employee
   */
  async getAllHolidays(filters?: {
    status?: HolidayStatus;
    employeeId?: string;
  }): Promise<IHoliday[]> {
    const query: Record<string, unknown> = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.employeeId) {
      if (!mongoose.Types.ObjectId.isValid(filters.employeeId)) {
        throw new Error('Invalid employee ID format');
      }
      query.employeeId = new mongoose.Types.ObjectId(filters.employeeId);
    }

    return await Holiday.find(query)
      .populate('employeeId')
      .sort({ createdAt: -1 });
  }

  /**
   * Get holidays for a specific employee
   */
  async getEmployeeHolidays(employeeId: string): Promise<IHoliday[]> {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error('Invalid employee ID format');
    }

    return await Holiday.find({ employeeId: new mongoose.Types.ObjectId(employeeId) })
      .sort({ startDate: -1 });
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
    if (!mongoose.Types.ObjectId.isValid(data.employeeId)) {
      throw new Error('Invalid employee ID format');
    }

    // Verify employee exists
    const employee = await employeeService.getEmployeeById(data.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate dates
    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    if (endDate < startDate) {
      throw new Error('End date must be after or equal to start date');
    }

    // Check for overlapping holidays
    const overlapping = await Holiday.findOne({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlapping) {
      throw new Error('This holiday overlaps with an existing holiday request');
    }

    // Calculate number of days
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const holiday = new Holiday({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      startDate,
      endDate,
      days,
      notes: data.notes,
      status: 'Pending',
    });

    return await holiday.save();
  }

  /**
   * Approve a holiday request
   */
  async approveHoliday(id: string): Promise<IHoliday | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid holiday ID format');
    }

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }

    if (holiday.status !== 'Pending') {
      throw new Error('Only pending holidays can be approved');
    }

    holiday.status = 'Approved';
    await holiday.save();

    // Update employee status if holiday is current or upcoming
    const now = new Date();
    if (holiday.startDate <= now && holiday.endDate >= now) {
      await employeeService.updateEmployeeStatus(holiday.employeeId.toString(), 'On Holiday');
    }

    return await holiday.populate('employeeId');
  }

  /**
   * Reject a holiday request
   */
  async rejectHoliday(id: string): Promise<IHoliday | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid holiday ID format');
    }

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }

    if (holiday.status !== 'Pending') {
      throw new Error('Only pending holidays can be rejected');
    }

    holiday.status = 'Rejected';
    await holiday.save();

    return await holiday.populate('employeeId');
  }

  /**
   * Get employee holiday balance (assuming 25 days per year)
   */
  async getEmployeeHolidayBalance(employeeId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error('Invalid employee ID format');
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const approvedHolidays = await Holiday.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      status: 'Approved',
      startDate: { $gte: yearStart, $lte: yearEnd },
    });

    const usedDays = approvedHolidays.reduce((sum, holiday) => sum + holiday.days, 0);
    const totalAllowance = 25; // Standard annual leave

    return Math.max(0, totalAllowance - usedDays);
  }

  /**
   * Check if employee is on holiday during a specific date range
   */
  async isEmployeeOnHoliday(employeeId: string, startDate: Date, endDate: Date): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error('Invalid employee ID format');
    }

    const holiday = await Holiday.findOne({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      status: 'Approved',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    return holiday !== null;
  }

  /**
   * Update employee statuses based on current holidays
   */
  async updateEmployeeHolidayStatuses(): Promise<void> {
    const now = new Date();

    // Find all approved holidays that are currently active
    const activeHolidays = await Holiday.find({
      status: 'Approved',
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Set these employees as "On Holiday"
    for (const holiday of activeHolidays) {
      await employeeService.updateEmployeeStatus(holiday.employeeId.toString(), 'On Holiday');
    }

    // Find employees whose holidays have ended
    const endedHolidays = await Holiday.find({
      status: 'Approved',
      endDate: { $lt: now },
    }).populate('employeeId');

    for (const holiday of endedHolidays) {
      const employee = holiday.employeeId as unknown as { _id: string; status: string };
      if (employee.status === 'On Holiday') {
        await employeeService.updateEmployeeStatus(employee._id.toString(), 'Available');
      }
    }
  }
}

export default new HolidayService();
