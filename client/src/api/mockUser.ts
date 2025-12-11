// Mock user data for the application
export const mockUser = {
  _id: 'mock-user-1',
  email: 'admin@rostermate.com',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
};

export const getMockUser = () => mockUser;
