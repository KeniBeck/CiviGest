import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types/theme.types';
import type { Configuracion } from '@/types/configuracion.types';

interface ThemeState {
  currentTheme: Theme | null;
  configuracion: Configuracion | null;
  setTheme: (theme: Theme) => void;
  setConfiguracion: (configuracion: Configuracion) => void;
  updateConfiguracion: (updates: Partial<Pick<Configuracion, 'nombreCliente' | 'slogan' | 'logo'>>) => void;
  clearTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: null,
      configuracion: null,

      setTheme: (theme: Theme) => {
        set({ currentTheme: theme });
      },

      setConfiguracion: (configuracion: Configuracion) => {
        set({
          configuracion,
          currentTheme: configuracion.theme,
        });
      },

      updateConfiguracion: (updates: Partial<Pick<Configuracion, 'nombreCliente' | 'slogan' | 'logo'>>) => {
        set((state) => ({
          configuracion: state.configuracion
            ? { ...state.configuracion, ...updates }
            : null,
        }));
      },

      clearTheme: () => {
        set({
          currentTheme: null,
          configuracion: null,
        });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
