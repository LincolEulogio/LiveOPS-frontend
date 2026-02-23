import { apiClient } from '@/shared/api/api.client';
import { AuthResponse, User } from '../types/auth.types';

export const authService = {
  async login(data: Record<string, unknown>): Promise<AuthResponse> {
    return apiClient.post('/auth/login', data);
  },

  async register(data: Record<string, unknown>): Promise<AuthResponse> {
    return apiClient.post('/auth/register', data);
  },

  async getProfile(): Promise<User> {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(data: { name?: string; password?: string }): Promise<User> {
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

  async checkSetup(): Promise<{ setupRequired: boolean }> {
    return apiClient.get('/auth/check-setup');
  },
};
