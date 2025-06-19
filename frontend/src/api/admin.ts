import api from './axios';

export interface User {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  role: 'user' | 'moderator' | 'admin';
  is_active: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  verified: number;
  byRole: { [key: string]: number };
}

export const adminApi = {
  // Get users with pagination and filters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
    is_verified?: boolean;
    search?: string;
  }): Promise<UsersResponse> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user statistics
  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (id: number, role: 'user' | 'moderator' | 'admin'): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (id: number): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/admin/users/${id}/status`);
    return response.data;
  },

  // Update admin notes
  updateAdminNotes: async (id: number, notes: string): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/admin/users/${id}/notes`, { notes });
    return response.data;
  },

  // Bulk update roles
  bulkUpdateRoles: async (userIds: number[], role: 'user' | 'moderator' | 'admin'): Promise<{ message: string; affectedRows: number }> => {
    const response = await api.post('/admin/users/bulk/roles', { userIds, role });
    return response.data;
  },

  // Bulk toggle status
  bulkToggleStatus: async (userIds: number[], isActive: boolean): Promise<{ message: string; affectedRows: number }> => {
    const response = await api.post('/admin/users/bulk/status', { userIds, isActive });
    return response.data;
  }
}; 