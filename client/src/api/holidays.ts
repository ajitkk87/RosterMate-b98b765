import api from './api';
import { Holiday } from '@/types/holiday';

// Description: Get all holidays
// Endpoint: GET /api/holidays
// Request: {}
// Response: { holidays: Holiday[] }
export const getHolidays = async () => {
  try {
    const response = await api.get('/api/holidays');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error fetching holidays:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Request holiday
// Endpoint: POST /api/holidays
// Request: { startDate: string, endDate: string, notes?: string }
// Response: { holiday: Holiday, message: string }
export const requestHoliday = async (data: { startDate: string; endDate: string; notes?: string }) => {
  try {
    const response = await api.post('/api/holidays', data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error requesting holiday:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Approve holiday
// Endpoint: PUT /api/holidays/:id/approve
// Request: {}
// Response: { holiday: Holiday, message: string }
export const approveHoliday = async (id: string) => {
  try {
    const response = await api.put(`/api/holidays/${id}/approve`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error approving holiday:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Reject holiday
// Endpoint: PUT /api/holidays/:id/reject
// Request: {}
// Response: { holiday: Holiday, message: string }
export const rejectHoliday = async (id: string) => {
  try {
    const response = await api.put(`/api/holidays/${id}/reject`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error rejecting holiday:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Get my holidays
// Endpoint: GET /api/holidays/my
// Request: {}
// Response: { holidays: Holiday[], balance: number }
export const getMyHolidays = async () => {
  try {
    const response = await api.get('/api/holidays/my');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error fetching my holidays:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};
