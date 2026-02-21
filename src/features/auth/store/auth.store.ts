import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;

  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,

      setAuth: (token: string, user: User) => set({ token, user }),

      setUser: (user: User) => set({ user }),

      clearAuth: () => set({ token: null, user: null }),

      setHydrated: (state: boolean) => set({ isHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        state?.setHydrated(true);
      },
    }
  )
);
