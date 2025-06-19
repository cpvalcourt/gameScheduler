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

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', { username, email, password });
  return response.data;
}; 