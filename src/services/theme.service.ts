import { api } from './api';
import type { Theme } from '@/types/theme.types';

export const themeService = {
  /**
   * Get default theme (PUBLIC endpoint - no token required)
   */
  getDefaultTheme: async () => {
    const response = await api.get<Theme>('/themes/default');
    return response.data;
  },
};
