import api from './api';
import { Employee } from '@/types/employee';

// Description: Get all employees
// Endpoint: GET /api/employees
// Request: {}
// Response: { employees: Employee[] }
export const getEmployees = async () => {
  try {
    const response = await api.get('/api/employees');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error fetching employees:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Get employee by ID
// Endpoint: GET /api/employees/:id
// Request: {}
// Response: { employee: Employee }
export const getEmployeeById = async (id: string) => {
  try {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error fetching employee:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Create new employee
// Endpoint: POST /api/employees
// Request: { name: string, email: string, department: string }
// Response: { employee: Employee, message: string }
export const createEmployee = async (data: { name: string; email: string; department: string }) => {
  try {
    const response = await api.post('/api/employees', data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error creating employee:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Update employee
// Endpoint: PUT /api/employees/:id
// Request: { name?: string, email?: string, department?: string }
// Response: { employee: Employee, message: string }
export const updateEmployee = async (id: string, data: { name?: string; email?: string; department?: string }) => {
  try {
    const response = await api.put(`/api/employees/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error updating employee:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};

// Description: Delete employee
// Endpoint: DELETE /api/employees/:id
// Request: {}
// Response: { message: string }
export const deleteEmployee = async (id: string) => {
  try {
    const response = await api.delete(`/api/employees/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error('Error deleting employee:', err);
    throw new Error(err?.response?.data?.message || err.message);
  }
};
