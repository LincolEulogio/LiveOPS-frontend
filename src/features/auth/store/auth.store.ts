import { create } from 'zustand';
import { User } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: User | null;
  isInitialized: boolean;

  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isInitialized: false,

  setAuth: (token, user) => set({ token, user, isInitialized: true }),

  clearAuth: () => set({ token: null, user: null }),

  setInitialized: (value) => set({ isInitialized: value }),
}));
