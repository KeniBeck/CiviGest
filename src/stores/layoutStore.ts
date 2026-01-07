import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  sidebarCollapsed: boolean;
}

interface LayoutActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useLayoutStore = create<LayoutState & LayoutActions>()(
  persist(
    (set) => ({
      // Estado
      sidebarCollapsed: false,

      // Acciones
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    { name: 'layout-storage' }
  )
);
