import { api } from './api';
import type { Theme, GetThemeParams } from '@/types/theme.types';
import type { PaginatedResponse } from '@/types/api.types';

export const themeService = {
  /**
   * Get all themes with pagination and filters
   */
  getAll: async (params?: GetThemeParams) => {
    const response = await api.get<PaginatedResponse<Theme>>('/themes/paginated', { params });
    return response;
  },

  /**
   * Get theme by ID
   */
  getById: async (id: number) => {
    const response = await api.get<Theme>(`/themes/${id}`);
    return response;
  },

  /**
   * Get default theme (PUBLIC endpoint - no token required)
   */
  getDefaultTheme: async () => {
    const response = await api.get<Theme>('/themes/default');
    return response.data;
  },
};
