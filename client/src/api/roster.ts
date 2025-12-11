import api from './api';
import { WeeklyRoster, DutyAssignment } from '@/types/roster';

// Description: Get roster for a specific week
// Endpoint: GET /api/roster?weekStart=YYYY-MM-DD
// Request: {}
// Response: { roster: WeeklyRoster | null }
export const getRosterByWeek = async (weekStart: string) => {
  try {
    const response = await api.get(`/api/roster?weekStart=${weekStart}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error fetching roster:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Generate roster for a specific week
// Endpoint: POST /api/roster/generate
// Request: { weekStart: string }
// Response: { roster: WeeklyRoster, message: string }
export const generateRoster = async (weekStart: string) => {
  try {
    const response = await api.post('/api/roster/generate', { weekStart });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error generating roster:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Reassign duty
// Endpoint: PUT /api/roster/reassign/:assignmentId
// Request: { employeeId: string }
// Response: { assignment: DutyAssignment, message: string }
export const reassignDuty = async (assignmentId: string, employeeId: string) => {
  try {
    const response = await api.put(`/api/roster/reassign/${assignmentId}`, { employeeId });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error reassigning duty:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Get roster history
// Endpoint: GET /api/roster/history
// Request: {}
// Response: { rosters: WeeklyRoster[] }
export const getRosterHistory = async () => {
  try {
    const response = await api.get('/api/roster/history');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error fetching roster history:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};
