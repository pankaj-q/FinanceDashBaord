import api from './api';
import type { AuthResponse, User, ApiResponse } from '../types';

export const authService = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      email,
      password,
      name,
    });
    
    if (data.data) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }
    
    return data.data!;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    
    if (data.data) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }
    
    return data.data!;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data!;
  },
};
