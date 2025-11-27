import { useQuery } from '@tanstack/react-query';
import { themeService } from '@/services/theme.service';
import { useThemeStore } from '@/stores/themeStore';

export const themeKeys = {
  default: ['theme', 'default'] as const,
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
