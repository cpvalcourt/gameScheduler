import api from './axios';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    is_verified: boolean;
  };
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    is_verified: boolean;
  };
  token: string;
}

interface PasswordResetRequestResponse {
  message: string;
}

interface PasswordResetResponse {
  message: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', { username, email, password });
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<PasswordResetRequestResponse> => {
  const response = await api.post<PasswordResetRequestResponse>('/auth/request-password-reset', { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string): Promise<PasswordResetResponse> => {
  const response = await api.post<PasswordResetResponse>('/auth/reset-password', { token, password });
  return response.data;
}; 