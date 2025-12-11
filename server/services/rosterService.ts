import { randomUUID } from 'crypto';
import Roster, { IRoster, DutyType, IDutyAssignment } from '../models/Roster';
import Employee from '../models/Employee';
import employeeService from './employeeService';
import holidayService from './holidayService';

class RosterService {
  /**
   * Get roster for a specific week
   */
  async getRosterByWeek(weekStart: string): Promise<IRoster | null> {
    const weekStartDate = new Date(weekStart);
    const weekStartStr = weekStartDate.toISOString().split('T')[0];

    let roster = await Roster.findByWeekStartDate(weekStartStr);
    if (!roster) return null;

    // parse assignments and populate employee data
    const assignments: IDutyAssignment[] = JSON.parse((roster as any).assignments || '[]');
    const populated = await Promise.all(assignments.map(async (a) => {
      const emp = await Employee.findById(a.employeeId as string);
      return { ...a, employee: emp } as any;
    }));

    return { ...roster, assignments: populated } as any;
  }

  /**
   * Generate a new roster for a specific week
   */
  async generateRoster(weekStart: string, createdBy: string): Promise<IRoster> {
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekStartStr = weekStartDate.toISOString().split('T')[0];

    // Check if roster already exists for this week
    const existingRoster = await Roster.findByWeekStartDate(weekStartStr);
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
    const sortByLastDuty = (a:any, b:any) => {
      const at = a.lastDutyDate ? new Date(a.lastDutyDate).getTime() : Number.NEGATIVE_INFINITY;
      const bt = b.lastDutyDate ? new Date(b.lastDutyDate).getTime() : Number.NEGATIVE_INFINITY;
      return at - bt;
    };

    availableDevelopers.sort(sortByLastDuty);
    availableOps.sort(sortByLastDuty);
    availablePlatform.sort(sortByLastDuty);

    // Assign duties
    const assignments = [
      { _id: randomUUID(), dutyType: 'Prod Duty - Developer' as DutyType, employeeId: availableDevelopers[0]._id },
      { _id: randomUUID(), dutyType: 'Prod Duty - Developer' as DutyType, employeeId: availableDevelopers[1]._id },
      { _id: randomUUID(), dutyType: 'Non-Prod Duty - Developer' as DutyType, employeeId: availableDevelopers[2]._id },
      { _id: randomUUID(), dutyType: 'Non-Prod Duty - Developer' as DutyType, employeeId: availableDevelopers[3]._id },
      { _id: randomUUID(), dutyType: 'Ops Duty' as DutyType, employeeId: availableOps[0]._id },
      { _id: randomUUID(), dutyType: 'Platform Duty' as DutyType, employeeId: availablePlatform[0]._id },
    ];

    // Create roster using CSV-backed model
    const roster = await Roster.create({
      weekStartDate: weekStartStr,
      weekEndDate: weekEndDate.toISOString().split('T')[0],
      assignments,
      createdBy,
    } as any);

    // Update last duty date and status for assigned employees
    for (const assignment of assignments) {
      await employeeService.updateLastDutyDate(assignment.employeeId.toString(), weekStartDate);
      await employeeService.updateEmployeeStatus(assignment.employeeId.toString(), 'On Duty');
    }

    console.log(`Roster created successfully for week starting ${weekStart}`);

    // Populate and return
    const created = await Roster.findById(roster._id as string);
    const createdAssignments = JSON.parse((created as any).assignments || '[]');
    const createdPopulated = await Promise.all(createdAssignments.map(async (a:any) => ({ ...a, employee: await Employee.findById(a.employeeId) })));
    return { ...(created as any), assignments: createdPopulated } as any;
  }

  /**
   * Reassign a duty to a different employee
   */
  async reassignDuty(assignmentId: string, newEmployeeId: string): Promise<IRoster | null> {
    if (!assignmentId) throw new Error('Invalid assignment ID format');
    if (!newEmployeeId) throw new Error('Invalid employee ID format');

    // Find roster containing this assignment
    // find roster containing this assignment by scanning all rosters
    const all = await Roster.find();
    const roster = all.find(r => {
      const assigns = JSON.parse((r as any).assignments || '[]');
      return assigns.some((a:any) => String(a._id) === String(assignmentId));
    }) as any;

    if (!roster) throw new Error('Assignment not found');

    const assignment = JSON.parse((roster as any).assignments || '[]').find((a:any) => String(a._id) === String(assignmentId));
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
      new Date(roster.weekStartDate),
      new Date(roster.weekEndDate)
    );

    if (isOnHoliday) {
      throw new Error('Selected employee is on holiday during this week');
    }

    const oldEmployeeId = assignment.employeeId;

    // Update assignment
    // update assignment
    const assignmentsArray = JSON.parse((roster as any).assignments || '[]');
    const idx = assignmentsArray.findIndex((a:any) => String(a._id) === String(assignmentId));
    assignmentsArray[idx].employeeId = newEmployeeId;
    await Roster.updateOne(roster._id as string, { assignments: assignmentsArray } as any);

    // Update employee statuses
    await employeeService.updateLastDutyDate(newEmployeeId, new Date(roster.weekStartDate));
    await employeeService.updateEmployeeStatus(newEmployeeId, 'On Duty');

    // Check if old employee has any other duties in this roster
    const rosterAssignments = JSON.parse((roster as any).assignments || '[]');
    const hasOtherDuties = rosterAssignments.some(
      (a:any) => String(a._id) !== String(assignmentId) && String(a.employeeId) === String(oldEmployeeId)
    );

    if (!hasOtherDuties) {
      // Check if they're on holiday, otherwise set to available
      const isOldEmployeeOnHoliday = await holidayService.isEmployeeOnHoliday(
        oldEmployeeId.toString(),
        new Date(roster.weekStartDate),
        new Date(roster.weekEndDate)
      );

      if (!isOldEmployeeOnHoliday) {
        await employeeService.updateEmployeeStatus(oldEmployeeId.toString(), 'Available');
      }
    }

    console.log(`Duty reassigned from ${oldEmployeeId} to ${newEmployeeId}`);

    // Return updated roster with populated employees
    const updated = await Roster.findById(roster._id as string);
    const updatedAssignments = JSON.parse((updated as any).assignments || '[]');
    const updatedPop = await Promise.all(updatedAssignments.map(async (a:any) => ({ ...a, employee: await Employee.findById(a.employeeId) })));
    return { ...(updated as any), assignments: updatedPop } as any;
  }

  /**
   * Get roster history
   */
  async getRosterHistory(limit = 10): Promise<IRoster[]> {
    const all = await Roster.find();
    // sort by weekStartDate descending
    all.sort((a:any,b:any) => (a.weekStartDate < b.weekStartDate ? 1 : -1));
    const sliced = all.slice(0, limit);
    // populate assignments
    return await Promise.all(sliced.map(async (r:any) => {
      const assigns = JSON.parse((r as any).assignments || '[]');
      const pop = await Promise.all(assigns.map(async (a:any) => ({ ...a, employee: await Employee.findById(a.employeeId) })));
      return { ...r, assignments: pop } as any;
    }));
  }

  /**
   * Delete a roster
   */
  async deleteRoster(id: string): Promise<boolean> {
    if (!id) throw new Error('Invalid roster ID format');

    const roster = await Roster.findById(id);
    if (!roster) return false;

    const assignments = JSON.parse((roster as any).assignments || '[]');
    for (const assignment of assignments) {
      const isOnHoliday = await holidayService.isEmployeeOnHoliday(assignment.employeeId.toString(), new Date(), new Date());
      if (!isOnHoliday) {
        await employeeService.updateEmployeeStatus(assignment.employeeId.toString(), 'Available');
      }
    }

    await Roster.deleteOne(id);
    return true;
  }

  /**
   * Filter employees who are available (not on holiday) during the specified date range
   */
  private async filterAvailableEmployees(employees: typeof Employee[], startDate: Date, endDate: Date) {
    const available = [];

    for (const employee of employees) {
      const isOnHoliday = await holidayService.isEmployeeOnHoliday(employee._id.toString(), startDate, endDate);
      if (!isOnHoliday) available.push(employee);
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
