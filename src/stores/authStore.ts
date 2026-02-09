import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  tokenType: string;
  expiresAt: number | null;
  isAgente: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, tokenType?: string, expiresIn?: number) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tokenType: 'Bearer',
      expiresAt: null,
      isAgente: false,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: User, token: string, tokenType = 'Bearer', expiresIn = 28800) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({
          user,
          token,
          tokenType,
          expiresAt,
          isAgente: user.isAgente === true,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          tokenType: 'Bearer',
          expiresAt: null,
          isAgente: false,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (user: User) => {
        set({ 
          user,
          isAgente: user.isAgente === true 
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
