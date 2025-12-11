import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import rosterService from '../services/rosterService';
import { ROLES } from 'shared';

const router = express.Router();

// Description: Get roster history
// Endpoint: GET /api/roster/history
// Request: {}
// Response: { rosters: WeeklyRoster[] }
router.get('/history', requireUser(), async (req: Request, res: Response) => {
  try {
    console.log('Fetching roster history');

    const rosters = await rosterService.getRosterHistory();

    // Format response
    const formattedRosters = rosters.map(roster => ({
      _id: roster._id,
      weekStartDate: roster.weekStartDate.toISOString().split('T')[0],
      weekEndDate: roster.weekEndDate.toISOString().split('T')[0],
      assignments: roster.assignments.map(assignment => {
        const employee = assignment.employeeId as unknown as {
          _id: string;
          name: string;
          email: string;
          department: string;
          employeeId: string;
          status: string;
        };
        return {
          _id: assignment._id,
          dutyType: assignment.dutyType,
          employee: {
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            employeeId: employee.employeeId,
            status: employee.status,
          },
        };
      }),
      createdAt: roster.createdAt.toISOString(),
      createdBy: roster.createdBy,
    }));

    res.status(200).json({ rosters: formattedRosters });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching roster history:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to fetch roster history' });
  }
});

// Description: Get roster for a specific week
// Endpoint: GET /api/roster?weekStart=YYYY-MM-DD
// Request: {}
// Response: { roster: WeeklyRoster | null }
router.get('/', requireUser(), async (req: Request, res: Response) => {
  try {
    const { weekStart } = req.query;

    if (!weekStart || typeof weekStart !== 'string') {
      return res.status(400).json({ message: 'weekStart query parameter is required' });
    }

    console.log(`Fetching roster for week starting: ${weekStart}`);

    const roster = await rosterService.getRosterByWeek(weekStart);

    if (!roster) {
      return res.status(200).json({ roster: null });
    }

    // Format response
    const formattedRoster = {
      _id: roster._id,
      weekStartDate: roster.weekStartDate.toISOString().split('T')[0],
      weekEndDate: roster.weekEndDate.toISOString().split('T')[0],
      assignments: roster.assignments.map(assignment => {
        const employee = assignment.employeeId as unknown as {
          _id: string;
          name: string;
          email: string;
          department: string;
          employeeId: string;
          status: string;
        };
        return {
          _id: assignment._id,
          dutyType: assignment.dutyType,
          employee: {
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            employeeId: employee.employeeId,
            status: employee.status,
          },
        };
      }),
      createdAt: roster.createdAt.toISOString(),
      createdBy: roster.createdBy,
    };

    res.status(200).json({ roster: formattedRoster });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching roster:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Failed to fetch roster' });
  }
});

// Description: Generate roster for a specific week
// Endpoint: POST /api/roster/generate
// Request: { weekStart: string }
// Response: { roster: WeeklyRoster, message: string }
router.post('/generate', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { weekStart } = req.body;

    if (!weekStart) {
      return res.status(400).json({ message: 'weekStart is required' });
    }

    const createdBy = req.user.email;

    console.log(`Generating roster for week starting: ${weekStart} by ${createdBy}`);

    const roster = await rosterService.generateRoster(weekStart, createdBy);

    // Format response
    const formattedRoster = {
      _id: roster._id,
      weekStartDate: roster.weekStartDate.toISOString().split('T')[0],
      weekEndDate: roster.weekEndDate.toISOString().split('T')[0],
      assignments: roster.assignments.map(assignment => {
        const employee = assignment.employeeId as unknown as {
          _id: string;
          name: string;
          email: string;
          department: string;
          employeeId: string;
          status: string;
        };
        return {
          _id: assignment._id,
          dutyType: assignment.dutyType,
          employee: {
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            employeeId: employee.employeeId,
            status: employee.status,
          },
        };
      }),
      createdAt: roster.createdAt.toISOString(),
      createdBy: roster.createdBy,
    };

    console.log(`Roster generated successfully for week starting: ${weekStart}`);

    res.status(201).json({
      roster: formattedRoster,
      message: 'Roster generated successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error generating roster:', err.message, err.stack);
    res.status(400).json({ message: err.message || 'Failed to generate roster' });
  }
});

// Description: Reassign duty
// Endpoint: PUT /api/roster/reassign/:assignmentId
// Request: { employeeId: string }
// Response: { assignment: DutyAssignment, message: string }
router.put('/reassign/:assignmentId', requireUser([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required' });
    }

    console.log(`Reassigning duty ${assignmentId} to employee ${employeeId}`);

    const roster = await rosterService.reassignDuty(assignmentId, employeeId);

    if (!roster) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find the updated assignment
    const updatedAssignment = roster.assignments.find(a => a._id.toString() === assignmentId);
    if (!updatedAssignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const employee = updatedAssignment.employeeId as unknown as {
      _id: string;
      name: string;
      email: string;
      department: string;
      employeeId: string;
      status: string;
    };

    const formattedAssignment = {
      _id: updatedAssignment._id,
      dutyType: updatedAssignment.dutyType,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        employeeId: employee.employeeId,
        status: employee.status,
      },
    };

    console.log(`Duty reassigned successfully to ${employee.name}`);

    res.status(200).json({
      assignment: formattedAssignment,
      message: 'Duty reassigned successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error reassigning duty:', err.message, err.stack);
    res.status(400).json({ message: err.message || 'Failed to reassign duty' });
  }
});

export default router;
