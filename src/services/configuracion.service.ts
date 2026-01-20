import { api } from './api';
import type { 
  Configuracion, 
  CreateConfiguracionDto, 
  UpdateConfiguracionDto 
} from '@/types/configuracion.types';

export const configuracionService = {
  /**
   * Get configuration by subsede ID (includes theme)
   */
  getBySubsede: async (subsedeId: number) => {
    const response = await api.get<Configuracion>(
      `/configuraciones/subsede/${subsedeId}`
    );
    return response;
  },

  /**
   * Get configuration by ID
   */
  getById: async (id: number) => {
    const response = await api.get<Configuracion>(`/configuraciones/${id}`);
    return response;
  },

  /**
   * Create new configuration
   */
  create: async (data: CreateConfiguracionDto) => {
    const response = await api.post<Configuracion>('/configuraciones', data);
    return response;
  },

  /**
   * Update existing configuration
   */
  update: async (id: number, data: UpdateConfiguracionDto) => {
    const response = await api.patch<Configuracion>(`/configuraciones/${id}`, data);
    return response;
  },

  /**
   * Delete configuration (soft delete)
   */
  delete: async (id: number) => {
    const response = await api.delete(`/configuraciones/${id}`);
    return response;
  },

  /**
   * Toggle active/inactive status
   */
  toggleActive: async (id: number) => {
    const response = await api.patch<Configuracion>(`/configuraciones/${id}/toggle-active`);
    return response;
  },

  /**
   * Upload logo for configuration
   */
  uploadLogo: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>(
      `/configuraciones/${id}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  },
};
