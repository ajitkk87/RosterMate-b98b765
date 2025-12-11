import Roster, { IRoster, DutyType } from '../models/Roster';
import Employee from '../models/Employee';
import employeeService from './employeeService';
import holidayService from './holidayService';
import mongoose from 'mongoose';

class RosterService {
  /**
   * Get roster for a specific week
   */
  async getRosterByWeek(weekStart: string): Promise<IRoster | null> {
    const weekStartDate = new Date(weekStart);

    const roster = await Roster.findOne({ weekStartDate })
      .populate({
        path: 'assignments.employeeId',
        model: 'Employee',
      });

    return roster;
  }

  /**
   * Generate a new roster for a specific week
   */
  async generateRoster(weekStart: string, createdBy: string): Promise<IRoster> {
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Check if roster already exists for this week
    const existingRoster = await Roster.findOne({ weekStartDate });
    if (existingRoster) {
      throw new Error('Roster already exists for this week. Please delete it first if you want to regenerate.');
    }

    console.log(`Generating roster for week starting ${weekStart}`);

    // Get all employees by department
    const developers = await Employee.find({ department: 'Developer' });
    const opsEmployees = await Employee.find({ department: 'Ops' });
    const platformEmployees = await Employee.find({ department: 'Platform' });

    // Filter out employees who are on holiday during this week
    const availableDevelopers = await this.filterAvailableEmployees(developers, weekStartDate, weekEndDate);
    const availableOps = await this.filterAvailableEmployees(opsEmployees, weekStartDate, weekEndDate);
    const availablePlatform = await this.filterAvailableEmployees(platformEmployees, weekStartDate, weekEndDate);

    console.log(`Available employees - Developers: ${availableDevelopers.length}, Ops: ${availableOps.length}, Platform: ${availablePlatform.length}`);

    // Validate we have enough employees
    if (availableDevelopers.length < 4) {
      throw new Error(`Insufficient available developers. Need 4, have ${availableDevelopers.length}`);
    }
    if (availableOps.length < 1) {
      throw new Error(`Insufficient available ops employees. Need 1, have ${availableOps.length}`);
    }
    if (availablePlatform.length < 1) {
      throw new Error(`Insufficient available platform employees. Need 1, have ${availablePlatform.length}`);
    }

    // Sort developers by last duty date (those who haven't had duty recently get priority)
    availableDevelopers.sort((a, b) => {
      if (!a.lastDutyDate) return -1;
      if (!b.lastDutyDate) return 1;
      return a.lastDutyDate.getTime() - b.lastDutyDate.getTime();
    });

    availableOps.sort((a, b) => {
      if (!a.lastDutyDate) return -1;
      if (!b.lastDutyDate) return 1;
      return a.lastDutyDate.getTime() - b.lastDutyDate.getTime();
    });

    availablePlatform.sort((a, b) => {
      if (!a.lastDutyDate) return -1;
      if (!b.lastDutyDate) return 1;
      return a.lastDutyDate.getTime() - b.lastDutyDate.getTime();
    });

    // Assign duties
    const assignments = [
      {
        _id: new mongoose.Types.ObjectId(),
        dutyType: 'Prod Duty - Developer' as DutyType,
        employeeId: availableDevelopers[0]._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        dutyType: 'Prod Duty - Developer' as DutyType,
        employeeId: availableDevelopers[1]._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        dutyType: 'Non-Prod Duty - Developer' as DutyType,
        employeeId: availableDevelopers[2]._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        dutyType: 'Non-Prod Duty - Developer' as DutyType,
        employeeId: availableDevelopers[3]._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        dutyType: 'Ops Duty' as DutyType,
        employeeId: availableOps[0]._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        dutyType: 'Platform Duty' as DutyType,
        employeeId: availablePlatform[0]._id,
      },
    ];

    // Create roster
    const roster = new Roster({
      weekStartDate,
      weekEndDate,
      assignments,
      createdBy,
    });

    await roster.save();

    // Update last duty date and status for assigned employees
    for (const assignment of assignments) {
      await employeeService.updateLastDutyDate(assignment.employeeId.toString(), weekStartDate);
      await employeeService.updateEmployeeStatus(assignment.employeeId.toString(), 'On Duty');
    }

    console.log(`Roster created successfully for week starting ${weekStart}`);

    // Populate and return
    return await Roster.findById(roster._id).populate({
      path: 'assignments.employeeId',
      model: 'Employee',
    }) as IRoster;
  }

  /**
   * Reassign a duty to a different employee
   */
  async reassignDuty(assignmentId: string, newEmployeeId: string): Promise<IRoster | null> {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new Error('Invalid assignment ID format');
    }

    if (!mongoose.Types.ObjectId.isValid(newEmployeeId)) {
      throw new Error('Invalid employee ID format');
    }

    // Find roster containing this assignment
    const roster = await Roster.findOne({ 'assignments._id': new mongoose.Types.ObjectId(assignmentId) });

    if (!roster) {
      throw new Error('Assignment not found');
    }

    const assignment = roster.assignments.find(a => a._id.toString() === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Verify new employee exists and is in correct department
    const newEmployee = await Employee.findById(newEmployeeId);
    if (!newEmployee) {
      throw new Error('Employee not found');
    }

    // Validate department match
    const requiredDepartment = this.getDepartmentForDutyType(assignment.dutyType);
    if (newEmployee.department !== requiredDepartment) {
      throw new Error(`Employee must be from ${requiredDepartment} department for this duty type`);
    }

    // Check if new employee is on holiday
    const isOnHoliday = await holidayService.isEmployeeOnHoliday(
      newEmployeeId,
      roster.weekStartDate,
      roster.weekEndDate
    );

    if (isOnHoliday) {
      throw new Error('Selected employee is on holiday during this week');
    }

    const oldEmployeeId = assignment.employeeId;

    // Update assignment
    assignment.employeeId = new mongoose.Types.ObjectId(newEmployeeId);
    await roster.save();

    // Update employee statuses
    await employeeService.updateLastDutyDate(newEmployeeId, roster.weekStartDate);
    await employeeService.updateEmployeeStatus(newEmployeeId, 'On Duty');

    // Check if old employee has any other duties in this roster
    const hasOtherDuties = roster.assignments.some(
      a => a._id.toString() !== assignmentId && a.employeeId.toString() === oldEmployeeId.toString()
    );

    if (!hasOtherDuties) {
      // Check if they're on holiday, otherwise set to available
      const isOldEmployeeOnHoliday = await holidayService.isEmployeeOnHoliday(
        oldEmployeeId.toString(),
        roster.weekStartDate,
        roster.weekEndDate
      );

      if (!isOldEmployeeOnHoliday) {
        await employeeService.updateEmployeeStatus(oldEmployeeId.toString(), 'Available');
      }
    }

    console.log(`Duty reassigned from ${oldEmployeeId} to ${newEmployeeId}`);

    // Return updated roster with populated employees
    return await Roster.findById(roster._id).populate({
      path: 'assignments.employeeId',
      model: 'Employee',
    });
  }

  /**
   * Get roster history
   */
  async getRosterHistory(limit = 10): Promise<IRoster[]> {
    return await Roster.find()
      .sort({ weekStartDate: -1 })
      .limit(limit)
      .populate({
        path: 'assignments.employeeId',
        model: 'Employee',
      });
  }

  /**
   * Delete a roster
   */
  async deleteRoster(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid roster ID format');
    }

    const roster = await Roster.findById(id);
    if (!roster) {
      return false;
    }

    // Update employee statuses back to available (if not on holiday)
    for (const assignment of roster.assignments) {
      const isOnHoliday = await holidayService.isEmployeeOnHoliday(
        assignment.employeeId.toString(),
        new Date(),
        new Date()
      );

      if (!isOnHoliday) {
        await employeeService.updateEmployeeStatus(assignment.employeeId.toString(), 'Available');
      }
    }

    await Roster.findByIdAndDelete(id);
    return true;
  }

  /**
   * Filter employees who are available (not on holiday) during the specified date range
   */
  private async filterAvailableEmployees(employees: typeof Employee[], startDate: Date, endDate: Date) {
    const available = [];

    for (const employee of employees) {
      const isOnHoliday = await holidayService.isEmployeeOnHoliday(
        employee._id.toString(),
        startDate,
        endDate
      );

      if (!isOnHoliday) {
        available.push(employee);
      }
    }

    return available;
  }

  /**
   * Get required department for a duty type
   */
  private getDepartmentForDutyType(dutyType: DutyType): string {
    if (dutyType.includes('Developer')) {
      return 'Developer';
    } else if (dutyType.includes('Ops')) {
      return 'Ops';
    } else if (dutyType.includes('Platform')) {
      return 'Platform';
    }
    throw new Error('Invalid duty type');
  }
}

export default new RosterService();
