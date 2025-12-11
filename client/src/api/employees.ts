import api from './api';
import { Employee } from '@/types/employee';

// Description: Get all employees
// Endpoint: GET /api/employees
// Request: {}
// Response: { employees: Employee[] }
export const getEmployees = async () => {
  // Mocking the response
  return new Promise<{ employees: Employee[] }>((resolve) => {
    setTimeout(() => {
      const mockEmployees: Employee[] = [
        // Developers (20)
        { _id: '1', name: 'John Smith', email: 'john.smith@company.com', department: 'Developer', employeeId: 'DEV001', status: 'Available' },
        { _id: '2', name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Developer', employeeId: 'DEV002', status: 'Available' },
        { _id: '3', name: 'Michael Chen', email: 'michael.c@company.com', department: 'Developer', employeeId: 'DEV003', status: 'On Holiday' },
        { _id: '4', name: 'Emily Davis', email: 'emily.d@company.com', department: 'Developer', employeeId: 'DEV004', status: 'Available' },
        { _id: '5', name: 'David Wilson', email: 'david.w@company.com', department: 'Developer', employeeId: 'DEV005', status: 'Available' },
        { _id: '6', name: 'Jessica Brown', email: 'jessica.b@company.com', department: 'Developer', employeeId: 'DEV006', status: 'Available' },
        { _id: '7', name: 'James Taylor', email: 'james.t@company.com', department: 'Developer', employeeId: 'DEV007', status: 'Available' },
        { _id: '8', name: 'Lisa Anderson', email: 'lisa.a@company.com', department: 'Developer', employeeId: 'DEV008', status: 'Available' },
        { _id: '9', name: 'Robert Martinez', email: 'robert.m@company.com', department: 'Developer', employeeId: 'DEV009', status: 'Available' },
        { _id: '10', name: 'Amanda White', email: 'amanda.w@company.com', department: 'Developer', employeeId: 'DEV010', status: 'Available' },
        { _id: '11', name: 'Christopher Lee', email: 'chris.l@company.com', department: 'Developer', employeeId: 'DEV011', status: 'Available' },
        { _id: '12', name: 'Michelle Garcia', email: 'michelle.g@company.com', department: 'Developer', employeeId: 'DEV012', status: 'Available' },
        { _id: '13', name: 'Daniel Rodriguez', email: 'daniel.r@company.com', department: 'Developer', employeeId: 'DEV013', status: 'Available' },
        { _id: '14', name: 'Jennifer Lopez', email: 'jennifer.l@company.com', department: 'Developer', employeeId: 'DEV014', status: 'Available' },
        { _id: '15', name: 'Matthew Harris', email: 'matthew.h@company.com', department: 'Developer', employeeId: 'DEV015', status: 'Available' },
        { _id: '16', name: 'Ashley Clark', email: 'ashley.c@company.com', department: 'Developer', employeeId: 'DEV016', status: 'Available' },
        { _id: '17', name: 'Joshua Lewis', email: 'joshua.l@company.com', department: 'Developer', employeeId: 'DEV017', status: 'Available' },
        { _id: '18', name: 'Stephanie Walker', email: 'stephanie.w@company.com', department: 'Developer', employeeId: 'DEV018', status: 'Available' },
        { _id: '19', name: 'Andrew Hall', email: 'andrew.h@company.com', department: 'Developer', employeeId: 'DEV019', status: 'Available' },
        { _id: '20', name: 'Nicole Young', email: 'nicole.y@company.com', department: 'Developer', employeeId: 'DEV020', status: 'Available' },
        // Ops (5)
        { _id: '21', name: 'Kevin King', email: 'kevin.k@company.com', department: 'Ops', employeeId: 'OPS001', status: 'Available' },
        { _id: '22', name: 'Rachel Wright', email: 'rachel.w@company.com', department: 'Ops', employeeId: 'OPS002', status: 'Available' },
        { _id: '23', name: 'Brian Scott', email: 'brian.s@company.com', department: 'Ops', employeeId: 'OPS003', status: 'Available' },
        { _id: '24', name: 'Laura Green', email: 'laura.g@company.com', department: 'Ops', employeeId: 'OPS004', status: 'Available' },
        { _id: '25', name: 'Steven Adams', email: 'steven.a@company.com', department: 'Ops', employeeId: 'OPS005', status: 'Available' },
        // Platform (5)
        { _id: '26', name: 'Karen Baker', email: 'karen.b@company.com', department: 'Platform', employeeId: 'PLT001', status: 'Available' },
        { _id: '27', name: 'Thomas Nelson', email: 'thomas.n@company.com', department: 'Platform', employeeId: 'PLT002', status: 'Available' },
        { _id: '28', name: 'Patricia Carter', email: 'patricia.c@company.com', department: 'Platform', employeeId: 'PLT003', status: 'Available' },
        { _id: '29', name: 'Richard Mitchell', email: 'richard.m@company.com', department: 'Platform', employeeId: 'PLT004', status: 'Available' },
        { _id: '30', name: 'Maria Perez', email: 'maria.p@company.com', department: 'Platform', employeeId: 'PLT005', status: 'Available' },
      ];
      resolve({ employees: mockEmployees });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/employees');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get employee by ID
// Endpoint: GET /api/employees/:id
// Request: {}
// Response: { employee: Employee }
export const getEmployeeById = async (id: string) => {
  // Mocking the response
  return new Promise<{ employee: Employee }>((resolve) => {
    setTimeout(() => {
      resolve({
        employee: { _id: id, name: 'John Smith', email: 'john.smith@company.com', department: 'Developer', employeeId: 'DEV001', status: 'Available' }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/employees/${id}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create new employee
// Endpoint: POST /api/employees
// Request: { name: string, email: string, department: string }
// Response: { employee: Employee, message: string }
export const createEmployee = async (data: { name: string; email: string; department: string }) => {
  // Mocking the response
  return new Promise<{ employee: Employee; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        employee: { _id: '31', ...data, employeeId: 'EMP031', status: 'Available' } as Employee,
        message: 'Employee created successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/employees', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update employee
// Endpoint: PUT /api/employees/:id
// Request: { name?: string, email?: string, department?: string }
// Response: { employee: Employee, message: string }
export const updateEmployee = async (id: string, data: { name?: string; email?: string; department?: string }) => {
  // Mocking the response
  return new Promise<{ employee: Employee; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        employee: { _id: id, ...data, employeeId: 'DEV001', status: 'Available' } as Employee,
        message: 'Employee updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/employees/${id}`, data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Delete employee
// Endpoint: DELETE /api/employees/:id
// Request: {}
// Response: { message: string }
export const deleteEmployee = async (id: string) => {
  // Mocking the response
  return new Promise<{ message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Employee deleted successfully' });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.delete(`/api/employees/${id}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};