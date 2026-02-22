import { apiClient } from '@/shared/api/api.client';
import { AuthResponse } from '../types/auth.types';

export const authService = {
  async login(data: any): Promise<AuthResponse> {
    return apiClient.post('/auth/login', data);
  },

  async register(data: any): Promise<AuthResponse> {
    return apiClient.post('/auth/register', data);
  },

  async getProfile(): Promise<any> {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(data: { name?: string; password?: string }): Promise<any> {
    return apiClient.patch('/auth/profile', data);
  },

  async logout(): Promise<void> {
    // Optionally hit backend so they invalidate refresh tokens/cookies
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore errors on logout
    }
  },
};
