import api from './api';
import { Holiday } from '@/types/holiday';

// Description: Get all holidays
// Endpoint: GET /api/holidays
// Request: {}
// Response: { holidays: Holiday[] }
export const getHolidays = async () => {
  // Mocking the response
  return new Promise<{ holidays: Holiday[] }>((resolve) => {
    setTimeout(() => {
      const mockHolidays: Holiday[] = [
        {
          _id: '1',
          employeeId: '3',
          employeeName: 'Michael Chen',
          department: 'Developer',
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          days: 5,
          notes: 'Family vacation',
          status: 'Approved',
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          _id: '2',
          employeeId: '5',
          employeeName: 'David Wilson',
          department: 'Developer',
          startDate: '2024-01-22',
          endDate: '2024-01-26',
          days: 5,
          notes: 'Medical appointment',
          status: 'Pending',
          createdAt: '2024-01-10T14:30:00Z'
        },
        {
          _id: '3',
          employeeId: '21',
          employeeName: 'Kevin King',
          department: 'Ops',
          startDate: '2024-02-05',
          endDate: '2024-02-09',
          days: 5,
          status: 'Pending',
          createdAt: '2024-01-12T09:15:00Z'
        }
      ];
      resolve({ holidays: mockHolidays });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/holidays');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Request holiday
// Endpoint: POST /api/holidays
// Request: { startDate: string, endDate: string, notes?: string }
// Response: { holiday: Holiday, message: string }
export const requestHoliday = async (data: { startDate: string; endDate: string; notes?: string }) => {
  // Mocking the response
  return new Promise<{ holiday: Holiday; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        holiday: {
          _id: '4',
          employeeId: '1',
          employeeName: 'John Smith',
          department: 'Developer',
          ...data,
          days: 5,
          status: 'Pending',
          createdAt: new Date().toISOString()
        },
        message: 'Holiday request submitted successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/holidays', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Approve holiday
// Endpoint: PUT /api/holidays/:id/approve
// Request: {}
// Response: { holiday: Holiday, message: string }
export const approveHoliday = async (id: string) => {
  // Mocking the response
  return new Promise<{ holiday: Holiday; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        holiday: {
          _id: id,
          employeeId: '5',
          employeeName: 'David Wilson',
          department: 'Developer',
          startDate: '2024-01-22',
          endDate: '2024-01-26',
          days: 5,
          status: 'Approved',
          createdAt: '2024-01-10T14:30:00Z'
        },
        message: 'Holiday approved successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/holidays/${id}/approve`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Reject holiday
// Endpoint: PUT /api/holidays/:id/reject
// Request: {}
// Response: { holiday: Holiday, message: string }
export const rejectHoliday = async (id: string) => {
  // Mocking the response
  return new Promise<{ holiday: Holiday; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        holiday: {
          _id: id,
          employeeId: '5',
          employeeName: 'David Wilson',
          department: 'Developer',
          startDate: '2024-01-22',
          endDate: '2024-01-26',
          days: 5,
          status: 'Rejected',
          createdAt: '2024-01-10T14:30:00Z'
        },
        message: 'Holiday rejected'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/holidays/${id}/reject`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get my holidays
// Endpoint: GET /api/holidays/my
// Request: {}
// Response: { holidays: Holiday[], balance: number }
export const getMyHolidays = async () => {
  // Mocking the response
  return new Promise<{ holidays: Holiday[]; balance: number }>((resolve) => {
    setTimeout(() => {
      resolve({
        holidays: [
          {
            _id: '1',
            employeeId: '1',
            employeeName: 'John Smith',
            department: 'Developer',
            startDate: '2024-03-10',
            endDate: '2024-03-15',
            days: 5,
            status: 'Approved',
            createdAt: '2024-01-05T10:00:00Z'
          }
        ],
        balance: 20
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/holidays/my');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};