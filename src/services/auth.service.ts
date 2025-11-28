import { api } from './api';
import type { LoginRequest, LoginResponse, ValidateResponse } from '@/types/auth.types';

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const payload: LoginRequest = { email, password };
    const response = await api.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  /**
   * Validate current token
   */
  validateToken: async (): Promise<ValidateResponse> => {
    const response = await api.get<ValidateResponse>('/auth/validate');
    return response.data;
  },
};
