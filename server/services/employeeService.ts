import Employee, { IEmployee, Department } from '../models/Employee';

class EmployeeService {
  /**
   * Get all employees, optionally filtered by department
   */
  async getAllEmployees(department?: Department): Promise<IEmployee[]> {
    const filter = department ? { department } : undefined;
    const employees = await Employee.find(filter);
    return employees.sort((a, b) => (a.employeeId || '').localeCompare(b.employeeId || ''));
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<IEmployee | null> {
    if (!id) {
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
    const existingEmployee = await Employee.findByEmail(data.email.toLowerCase());
    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    const employeeId = await this.generateEmployeeId(data.department);

    return await Employee.create({
      ...data,
      employeeId,
      status: 'Available',
    });
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
    if (!id) {
      throw new Error('Invalid employee ID format');
    }

    if (data.email) {
      const all = await Employee.find({});
      const existing = all.find(e => e.email === data.email?.toLowerCase() && e._id !== id);
      if (existing) {
        throw new Error('Employee with this email already exists');
      }
    }

    return await Employee.updateOne(id, data as any);
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Invalid employee ID format');
    }

    return await Employee.deleteOne(id);
  }

  /**
   * Update employee status
   */
  async updateEmployeeStatus(id: string, status: 'Available' | 'On Holiday' | 'On Duty'): Promise<IEmployee | null> {
    if (!id) {
      throw new Error('Invalid employee ID format');
    }

    return await Employee.updateOne(id, { status } as any);
  }

  /**
   * Get available employees by department (not on holiday or duty)
   */
  async getAvailableEmployees(department: Department, excludeIds: string[] = []): Promise<IEmployee[]> {
    const all = await Employee.find({ department, status: 'Available' });
    const filtered = all.filter(e => !excludeIds.includes(e._id || ''));
    return filtered.sort((a, b) => {
      const aDate = a.lastDutyDate || '';
      const bDate = b.lastDutyDate || '';
      if (aDate === bDate) return (a.employeeId || '').localeCompare(b.employeeId || '');
      return aDate.localeCompare(bDate);
    });
  }

  /**
   * Update last duty date for an employee
   */
  async updateLastDutyDate(id: string, date: Date): Promise<void> {
    if (!id) {
      throw new Error('Invalid employee ID format');
    }

    await Employee.updateOne(id, { lastDutyDate: date.toISOString() } as any);
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
    const all = await Employee.find({});
    const filtered = all.filter(e => (e.employeeId || '').startsWith(prefix));
    filtered.sort((a, b) => (b.employeeId || '').localeCompare(a.employeeId || ''));

    let nextNumber = 1;
    if (filtered.length > 0) {
      const lastEmployee = filtered[0];
      const match = (lastEmployee.employeeId || '').match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }
}

export default new EmployeeService();
