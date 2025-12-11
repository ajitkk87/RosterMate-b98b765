import Employee, { IEmployee, Department } from '../models/Employee';
import mongoose from 'mongoose';

class EmployeeService {
  /**
   * Get all employees, optionally filtered by department
   */
  async getAllEmployees(department?: Department): Promise<IEmployee[]> {
    const filter = department ? { department } : {};
    return await Employee.find(filter).sort({ employeeId: 1 });
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<IEmployee | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid employee ID format');
    }
    return await Employee.findById(id);
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: {
    name: string;
    email: string;
    department: Department;
  }): Promise<IEmployee> {
    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: data.email.toLowerCase() });
    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    // Generate employee ID based on department
    const employeeId = await this.generateEmployeeId(data.department);

    const employee = new Employee({
      ...data,
      employeeId,
      status: 'Available',
    });

    return await employee.save();
  }

  /**
   * Update an employee
   */
  async updateEmployee(
    id: string,
    data: {
      name?: string;
      email?: string;
      department?: Department;
    }
  ): Promise<IEmployee | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid employee ID format');
    }

    // If email is being updated, check for duplicates
    if (data.email) {
      const existingEmployee = await Employee.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return employee;
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid employee ID format');
    }

    const result = await Employee.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Update employee status
   */
  async updateEmployeeStatus(id: string, status: 'Available' | 'On Holiday' | 'On Duty'): Promise<IEmployee | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid employee ID format');
    }

    return await Employee.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
  }

  /**
   * Get available employees by department (not on holiday or duty)
   */
  async getAvailableEmployees(department: Department, excludeIds: string[] = []): Promise<IEmployee[]> {
    const filter: Record<string, unknown> = {
      department,
      status: 'Available',
    };

    if (excludeIds.length > 0) {
      filter._id = { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    return await Employee.find(filter).sort({ lastDutyDate: 1, employeeId: 1 });
  }

  /**
   * Update last duty date for an employee
   */
  async updateLastDutyDate(id: string, date: Date): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid employee ID format');
    }

    await Employee.findByIdAndUpdate(id, { $set: { lastDutyDate: date } });
  }

  /**
   * Generate a unique employee ID based on department
   */
  private async generateEmployeeId(department: Department): Promise<string> {
    let prefix: string;
    switch (department) {
      case 'Developer':
        prefix = 'DEV';
        break;
      case 'Ops':
        prefix = 'OPS';
        break;
      case 'Platform':
        prefix = 'PLT';
        break;
    }

    // Find the highest existing ID for this department
    const lastEmployee = await Employee.findOne({ employeeId: new RegExp(`^${prefix}`) })
      .sort({ employeeId: -1 })
      .limit(1);

    let nextNumber = 1;
    if (lastEmployee) {
      const match = lastEmployee.employeeId.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }
}

export default new EmployeeService();
