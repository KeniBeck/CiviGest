import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { configuracionService } from '@/services/configuracion.service';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { ROUTES } from '@/config/routes';

export const authKeys = {
  validate: ['auth', 'validate'] as const,
};

// ============================================
// VALIDAR TOKEN - Al iniciar la app
// ============================================
export const useValidateToken = () => {
  const { token, clearAuth } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.validate,
    queryFn: async () => {
      // Llamar al endpoint de validación
      const response = await authService.validateToken();
      return response;
    },
    enabled: !!token, // Solo si hay token en localStorage
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Manejar error de validación (React Query v5 no tiene onError)
  if (query.isError && token) {
    clearAuth();
  }

  return query;
};

// ============================================
// LOGIN - Con carga automática de configuración
// ============================================
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const { setConfiguracion } = useThemeStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // 1. Login
      const loginResponse = await authService.login(
        credentials.email,
        credentials.password
      );

      const { user, accessToken } = loginResponse;

      // 2. GUARDAR TOKEN PRIMERO (para que esté disponible en el interceptor)
      setAuth(user, accessToken);
      console.log('✅ Token guardado antes de llamar configuración');

      // 3. Cargar configuración del municipio (incluye tema)
      // Ahora el interceptor SÍ encontrará el token en localStorage
      const configResponse = await configuracionService.getBySubsede(
        user.subsedeId
      );

      return {
        user,
        accessToken,
        configuracion: configResponse.data,
      };
    },
    onSuccess: ({ configuracion }) => {
      // Guardar configuración y tema en Zustand
      setConfiguracion(configuracion);

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: authKeys.validate });

      // Redirigir a dashboard
      navigate(ROUTES.DASHBOARD);
    },
  });
};

// ============================================
// LOGOUT
// ============================================
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();
  const { clearTheme } = useThemeStore();

  return useMutation({
    mutationFn: async () => {
      // Aquí podrías llamar endpoint de logout si existe
    },
    onSuccess: () => {
      clearAuth();
      clearTheme();
      queryClient.clear(); // Limpiar todo el caché
      navigate(ROUTES.LOGIN);
    },
  });
};
