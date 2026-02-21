import { create } from 'zustand';

interface AppState {
  // Global Modals/Drawers
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Scoped Production Context
  activeProductionId: string | null;
  setActiveProductionId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  activeProductionId: null,
  setActiveProductionId: (id) => set({ activeProductionId: id }),
}));
