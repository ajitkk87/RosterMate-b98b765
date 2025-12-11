import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import employeeService from '../services/employeeService';
import { ROLES } from 'shared';

const router = express.Router();

// Description: Get all employees
// Endpoint: GET /api/employees
// Request: { department?: string }
// Response: { employees: Employee[] }
router.get('/', requireUser(), async (req: Request, res: Response) => {
  try {
    const { department } = req.query;

    console.log(`Fetching employees${department ? ` for department: ${department}` : ''}`);

    const employees = await employeeService.getAllEmployees(
      department as 'Developer' | 'Ops' | 'Platform' | undefined
    );

    res.status(200).json({ employees });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching employees:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to fetch employees' });
  }
});

// Description: Get employee by ID
// Endpoint: GET /api/employees/:id
// Request: {}
// Response: { employee: Employee }
router.get('/:id', requireUser(), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Fetching employee with ID: ${id}`);

    const employee = await employeeService.getEmployeeById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ employee });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching employee:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to fetch employee' });
  }
});

// Description: Create new employee
// Endpoint: POST /api/employees
// Request: { name: string, email: string, department: string }
// Response: { employee: Employee, message: string }
router.post('/', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ message: 'Name, email, and department are required' });
    }

    console.log(`Creating new employee: ${name} (${email}) - ${department}`);

    const employee = await employeeService.createEmployee({ name, email, department });

    console.log(`Employee created successfully with ID: ${employee._id}`);

    res.status(201).json({
      employee,
      message: 'Employee created successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating employee:', err.message, err.stack);
    res.status(400).json({ message: err.message || 'Failed to create employee' });
  }
});

// Description: Update employee
// Endpoint: PUT /api/employees/:id
// Request: { name?: string, email?: string, department?: string }
// Response: { employee: Employee, message: string }
router.put('/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;

    console.log(`Updating employee with ID: ${id}`);

    const employee = await employeeService.updateEmployee(id, { name, email, department });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log(`Employee updated successfully: ${employee._id}`);

    res.status(200).json({
      employee,
      message: 'Employee updated successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating employee:', err.message, err.stack);
    res.status(400).json({ message: err.message || 'Failed to update employee' });
  }
});

// Description: Delete employee
// Endpoint: DELETE /api/employees/:id
// Request: {}
// Response: { message: string }
router.delete('/:id', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Deleting employee with ID: ${id}`);

    const deleted = await employeeService.deleteEmployee(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log(`Employee deleted successfully: ${id}`);

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting employee:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to delete employee' });
  }
});

export default router;
