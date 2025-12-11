import api from './api';
import { WeeklyRoster } from '@/types/roster';

// Description: Get roster for a specific week
// Endpoint: GET /api/roster?weekStart=YYYY-MM-DD
// Request: {}
// Response: { roster: WeeklyRoster | null }
export const getRosterByWeek = async (weekStart: string) => {
  // Mocking the response
  return new Promise<{ roster: WeeklyRoster | null }>((resolve) => {
    setTimeout(() => {
      resolve({
        roster: {
          _id: '1',
          weekStartDate: weekStart,
          weekEndDate: '2024-01-21',
          assignments: [
            {
              _id: 'a1',
              dutyType: 'Prod Duty - Developer',
              employee: { _id: '1', name: 'John Smith', email: 'john.smith@company.com', department: 'Developer', employeeId: 'DEV001', status: 'On Duty' }
            },
            {
              _id: 'a2',
              dutyType: 'Prod Duty - Developer',
              employee: { _id: '2', name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Developer', employeeId: 'DEV002', status: 'On Duty' }
            },
            {
              _id: 'a3',
              dutyType: 'Non-Prod Duty - Developer',
              employee: { _id: '4', name: 'Emily Davis', email: 'emily.d@company.com', department: 'Developer', employeeId: 'DEV004', status: 'On Duty' }
            },
            {
              _id: 'a4',
              dutyType: 'Non-Prod Duty - Developer',
              employee: { _id: '5', name: 'David Wilson', email: 'david.w@company.com', department: 'Developer', employeeId: 'DEV005', status: 'On Duty' }
            },
            {
              _id: 'a5',
              dutyType: 'Ops Duty',
              employee: { _id: '21', name: 'Kevin King', email: 'kevin.k@company.com', department: 'Ops', employeeId: 'OPS001', status: 'On Duty' }
            },
            {
              _id: 'a6',
              dutyType: 'Platform Duty',
              employee: { _id: '26', name: 'Karen Baker', email: 'karen.b@company.com', department: 'Platform', employeeId: 'PLT001', status: 'On Duty' }
            }
          ],
          createdAt: '2024-01-12T10:00:00Z',
          createdBy: 'admin'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/roster?weekStart=${weekStart}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Generate roster for a specific week
// Endpoint: POST /api/roster/generate
// Request: { weekStart: string }
// Response: { roster: WeeklyRoster, message: string }
export const generateRoster = async (weekStart: string) => {
  // Mocking the response
  return new Promise<{ roster: WeeklyRoster; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        roster: {
          _id: '2',
          weekStartDate: weekStart,
          weekEndDate: '2024-01-28',
          assignments: [
            {
              _id: 'a7',
              dutyType: 'Prod Duty - Developer',
              employee: { _id: '6', name: 'Jessica Brown', email: 'jessica.b@company.com', department: 'Developer', employeeId: 'DEV006', status: 'On Duty' }
            },
            {
              _id: 'a8',
              dutyType: 'Prod Duty - Developer',
              employee: { _id: '7', name: 'James Taylor', email: 'james.t@company.com', department: 'Developer', employeeId: 'DEV007', status: 'On Duty' }
            },
            {
              _id: 'a9',
              dutyType: 'Non-Prod Duty - Developer',
              employee: { _id: '8', name: 'Lisa Anderson', email: 'lisa.a@company.com', department: 'Developer', employeeId: 'DEV008', status: 'On Duty' }
            },
            {
              _id: 'a10',
              dutyType: 'Non-Prod Duty - Developer',
              employee: { _id: '9', name: 'Robert Martinez', email: 'robert.m@company.com', department: 'Developer', employeeId: 'DEV009', status: 'On Duty' }
            },
            {
              _id: 'a11',
              dutyType: 'Ops Duty',
              employee: { _id: '22', name: 'Rachel Wright', email: 'rachel.w@company.com', department: 'Ops', employeeId: 'OPS002', status: 'On Duty' }
            },
            {
              _id: 'a12',
              dutyType: 'Platform Duty',
              employee: { _id: '27', name: 'Thomas Nelson', email: 'thomas.n@company.com', department: 'Platform', employeeId: 'PLT002', status: 'On Duty' }
            }
          ],
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        },
        message: 'Roster generated successfully'
      });
    }, 2000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/roster/generate', { weekStart });
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Reassign duty
// Endpoint: PUT /api/roster/reassign/:assignmentId
// Request: { employeeId: string }
// Response: { assignment: any, message: string }
export const reassignDuty = async (assignmentId: string, employeeId: string) => {
  // Mocking the response
  return new Promise<{ assignment: any; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        assignment: {
          _id: assignmentId,
          dutyType: 'Prod Duty - Developer',
          employee: { _id: employeeId, name: 'New Employee', email: 'new@company.com', department: 'Developer', employeeId: 'DEV999', status: 'On Duty' }
        },
        message: 'Duty reassigned successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/roster/reassign/${assignmentId}`, { employeeId });
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get roster history
// Endpoint: GET /api/roster/history
// Request: {}
// Response: { rosters: WeeklyRoster[] }
export const getRosterHistory = async () => {
  // Mocking the response
  return new Promise<{ rosters: WeeklyRoster[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        rosters: [
          {
            _id: '1',
            weekStartDate: '2024-01-08',
            weekEndDate: '2024-01-14',
            assignments: [
              {
                _id: 'a1',
                dutyType: 'Prod Duty - Developer',
                employee: { _id: '1', name: 'John Smith', email: 'john.smith@company.com', department: 'Developer', employeeId: 'DEV001', status: 'Available' }
              },
              {
                _id: 'a2',
                dutyType: 'Prod Duty - Developer',
                employee: { _id: '2', name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Developer', employeeId: 'DEV002', status: 'Available' }
              },
              {
                _id: 'a3',
                dutyType: 'Non-Prod Duty - Developer',
                employee: { _id: '4', name: 'Emily Davis', email: 'emily.d@company.com', department: 'Developer', employeeId: 'DEV004', status: 'Available' }
              },
              {
                _id: 'a4',
                dutyType: 'Non-Prod Duty - Developer',
                employee: { _id: '5', name: 'David Wilson', email: 'david.w@company.com', department: 'Developer', employeeId: 'DEV005', status: 'Available' }
              },
              {
                _id: 'a5',
                dutyType: 'Ops Duty',
                employee: { _id: '21', name: 'Kevin King', email: 'kevin.k@company.com', department: 'Ops', employeeId: 'OPS001', status: 'Available' }
              },
              {
                _id: 'a6',
                dutyType: 'Platform Duty',
                employee: { _id: '26', name: 'Karen Baker', email: 'karen.b@company.com', department: 'Platform', employeeId: 'PLT001', status: 'Available' }
              }
            ],
            createdAt: '2024-01-05T10:00:00Z',
            createdBy: 'admin'
          },
          {
            _id: '2',
            weekStartDate: '2024-01-01',
            weekEndDate: '2024-01-07',
            assignments: [
              {
                _id: 'a7',
                dutyType: 'Prod Duty - Developer',
                employee: { _id: '10', name: 'Amanda White', email: 'amanda.w@company.com', department: 'Developer', employeeId: 'DEV010', status: 'Available' }
              },
              {
                _id: 'a8',
                dutyType: 'Prod Duty - Developer',
                employee: { _id: '11', name: 'Christopher Lee', email: 'chris.l@company.com', department: 'Developer', employeeId: 'DEV011', status: 'Available' }
              },
              {
                _id: 'a9',
                dutyType: 'Non-Prod Duty - Developer',
                employee: { _id: '12', name: 'Michelle Garcia', email: 'michelle.g@company.com', department: 'Developer', employeeId: 'DEV012', status: 'Available' }
              },
              {
                _id: 'a10',
                dutyType: 'Non-Prod Duty - Developer',
                employee: { _id: '13', name: 'Daniel Rodriguez', email: 'daniel.r@company.com', department: 'Developer', employeeId: 'DEV013', status: 'Available' }
              },
              {
                _id: 'a11',
                dutyType: 'Ops Duty',
                employee: { _id: '23', name: 'Brian Scott', email: 'brian.s@company.com', department: 'Ops', employeeId: 'OPS003', status: 'Available' }
              },
              {
                _id: 'a12',
                dutyType: 'Platform Duty',
                employee: { _id: '28', name: 'Patricia Carter', email: 'patricia.c@company.com', department: 'Platform', employeeId: 'PLT003', status: 'Available' }
              }
            ],
            createdAt: '2023-12-28T10:00:00Z',
            createdBy: 'admin'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/roster/history');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};