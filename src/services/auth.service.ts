import { api } from './api';
import type { 
  LoginRequest, 
  AgenteLoginRequest,
  LoginResponse, 
  ValidateResponse,
  ChangePasswordRequest,
  User
} from '@/types/auth.types';

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
   * Login agente with numPlaca and password
   */
  loginAgente: async (numPlaca: string, contrasena: string): Promise<LoginResponse> => {
    const payload: AgenteLoginRequest = { numPlaca, contrasena };
    const response = await api.post<LoginResponse>('/agentes/auth/login', payload);
    return response.data;
  },

  /**
   * Validate current token
   */
  validateToken: async (): Promise<ValidateResponse> => {
    const response = await api.get<ValidateResponse>('/auth/validate');
    return response.data;
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Get agente profile
   */
  getAgenteProfile: async (): Promise<User> => {
    const response = await api.get<User>('/agentes/auth/profile');
    return response.data;
  },

  /**
   * Change password for regular user
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/auth/change-password', data);
  },

  /**
   * Change password for agente
   */
  changeAgentePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/agentes/auth/change-password', data);
  },
};
