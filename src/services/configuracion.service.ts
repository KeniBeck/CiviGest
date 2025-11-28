import { api } from './api';
import type { Configuracion } from '@/types/configuracion.types';

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
};
