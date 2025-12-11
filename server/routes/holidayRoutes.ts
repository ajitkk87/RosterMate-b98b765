import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import holidayService from '../services/holidayService';
import { ROLES } from 'shared';

const router = express.Router();

// Description: Get my holidays
// Endpoint: GET /api/holidays/my
// Request: {}
// Response: { holidays: Holiday[], balance: number }
router.get('/my', requireUser(), async (req: Request, res: Response) => {
  try {
    const userId = req.user._id.toString();

    console.log(`Fetching holidays for user: ${userId}`);

    const holidays = await holidayService.getEmployeeHolidays(userId);
    const balance = await holidayService.getEmployeeHolidayBalance(userId);

    res.status(200).json({ holidays, balance });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching user holidays:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to fetch holidays' });
  }
});

// Description: Get all holidays
// Endpoint: GET /api/holidays
// Request: { status?: string, employeeId?: string }
// Response: { holidays: Holiday[] }
router.get('/', requireUser(), async (req: Request, res: Response) => {
  try {
    const { status, employeeId } = req.query;

    console.log(`Fetching holidays with filters - status: ${status || 'all'}, employeeId: ${employeeId || 'all'}`);

    const holidays = await holidayService.getAllHolidays({
      status: status as 'Pending' | 'Approved' | 'Rejected' | undefined,
      employeeId: employeeId as string | undefined,
    });

    // Populate employee data for response
    const populatedHolidays = await Promise.all(
      holidays.map(async (holiday) => {
        const employee = holiday.employeeId as unknown as { _id: string; name: string; email: string; department: string };
        return {
          _id: holiday._id,
          employeeId: employee._id,
          employeeName: employee.name,
          department: employee.department,
          startDate: holiday.startDate.toISOString().split('T')[0],
          endDate: holiday.endDate.toISOString().split('T')[0],
          days: holiday.days,
          notes: holiday.notes,
          status: holiday.status,
          createdAt: holiday.createdAt.toISOString(),
        };
      })
    );

    res.status(200).json({ holidays: populatedHolidays });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching holidays:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to fetch holidays' });
  }
});

// Description: Request holiday
// Endpoint: POST /api/holidays
// Request: { startDate: string, endDate: string, notes?: string }
// Response: { holiday: Holiday, message: string }
router.post('/', requireUser(), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, notes } = req.body;
    const employeeId = req.user._id.toString();

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    console.log(`Creating holiday request for employee: ${employeeId}, dates: ${startDate} to ${endDate}`);

    const holiday = await holidayService.requestHoliday({
      employeeId,
      startDate,
      endDate,
      notes,
    });

    const employee = req.user;
    const holidayResponse = {
      _id: holiday._id,
      employeeId: holiday.employeeId.toString(),
      employeeName: employee.email,
      department: 'Developer', // This would come from employee data
      startDate: holiday.startDate.toISOString().split('T')[0],
      endDate: holiday.endDate.toISOString().split('T')[0],
      days: holiday.days,
      notes: holiday.notes,
      status: holiday.status,
      createdAt: holiday.createdAt.toISOString(),
    };

    console.log(`Holiday request created successfully: ${holiday._id}`);

    res.status(201).json({
      holiday: holidayResponse,
      message: 'Holiday request submitted successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating holiday request:', err.message, err.stack);
    res.status(400).json({ message: err.message || 'Failed to create holiday request' });
  }
});

// Description: Approve holiday
// Endpoint: PUT /api/holidays/:id/approve
// Request: {}
// Response: { holiday: Holiday, message: string }
router.put('/:id/approve', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Approving holiday request: ${id}`);

    const holiday = await holidayService.approveHoliday(id);

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const employee = holiday.employeeId as unknown as { _id: string; name: string; email: string; department: string };
    const holidayResponse = {
      _id: holiday._id,
      employeeId: employee._id,
      employeeName: employee.name,
      department: employee.department,
      startDate: holiday.startDate.toISOString().split('T')[0],
      endDate: holiday.endDate.toISOString().split('T')[0],
      days: holiday.days,
      notes: holiday.notes,
      status: holiday.status,
      createdAt: holiday.createdAt.toISOString(),
    };

    console.log(`Holiday approved successfully: ${id}`);

    res.status(200).json({
      holiday: holidayResponse,
      message: 'Holiday approved successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error approving holiday:', err.message, err.stack);
    res.status(400).json({ message: err.message || 'Failed to approve holiday' });
  }
});

// Description: Reject holiday
// Endpoint: PUT /api/holidays/:id/reject
// Request: {}
// Response: { holiday: Holiday, message: string }
router.put('/:id/reject', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Rejecting holiday request: ${id}`);

    const holiday = await holidayService.rejectHoliday(id);

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const employee = holiday.employeeId as unknown as { _id: string; name: string; email: string; department: string };
    const holidayResponse = {
      _id: holiday._id,
      employeeId: employee._id,
      employeeName: employee.name,
      department: employee.department,
      startDate: holiday.startDate.toISOString().split('T')[0],
      endDate: holiday.endDate.toISOString().split('T')[0],
      days: holiday.days,
      notes: holiday.notes,
      status: holiday.status,
      createdAt: holiday.createdAt.toISOString(),
    };

    console.log(`Holiday rejected: ${id}`);

    res.status(200).json({
      holiday: holidayResponse,
      message: 'Holiday rejected',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error rejecting holiday:', err.message, err.stack);
    res.status(400).json({ message: err.message || 'Failed to reject holiday' });
  }
});

export default router;
