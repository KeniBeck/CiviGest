import { useQuery } from '@tanstack/react-query';
import { themeService } from '@/services/theme.service';
import { useThemeStore } from '@/stores/themeStore';
import type { GetThemeParams } from '@/types/theme.types';

export const themeKeys = {
  all: ['themes'] as const,
  lists: () => [...themeKeys.all, 'list'] as const,
  list: (params?: GetThemeParams) => [...themeKeys.lists(), params] as const,
  details: () => [...themeKeys.all, 'detail'] as const,
  detail: (id: number) => [...themeKeys.details(), id] as const,
  default: ['theme', 'default'] as const,
};

// ============================================
// OBTENER TODOS LOS TEMAS (con paginación)
// ============================================
export const useThemes = (params?: GetThemeParams) => {
  return useQuery({
    queryKey: themeKeys.list(params),
    queryFn: async () => {
      const response = await themeService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

// ============================================
// OBTENER UN TEMA POR ID
// ============================================
export const useTheme = (id: number) => {
  return useQuery({
    queryKey: themeKeys.detail(id),
    queryFn: async () => {
      const response = await themeService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

// ============================================
// TEMA DEFAULT - Para login (sin auth)
// ============================================
export const useDefaultTheme = () => {
  const { setTheme } = useThemeStore();

  return useQuery({
    queryKey: themeKeys.default,
    queryFn: async () => {
      const theme = await themeService.getDefaultTheme();

      // Guardar en Zustand automáticamente
      setTheme(theme);

      return theme;
    },
    staleTime: Infinity, // Nunca expira
    gcTime: Infinity, // React Query v5 usa gcTime en lugar de cacheTime
  });
};
