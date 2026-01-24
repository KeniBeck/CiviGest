import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { configuracionService } from '@/services/configuracion.service';
import { imagenesService } from '@/services/imagenes.service';
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
  const { token, user, clearAuth } = useAuthStore();
  const { setConfiguracion } = useThemeStore();

  const query = useQuery({
    queryKey: authKeys.validate,
    queryFn: async () => {
      // 1. Validar token
      const response = await authService.validateToken();
      
      // 2. Si el token es válido y hay usuario, cargar configuración
      if (user?.subsedeId) {
        try {
          const configResponse = await configuracionService.getBySubsede(user.subsedeId);
          
          // Generar URL completa del logo si existe
          const configuracionConLogoUrl = {
            ...configResponse.data,
            logo: configResponse.data.logo && !configResponse.data.logo.startsWith('http')
              ? imagenesService.getImageUrl({ type: 'configuraciones', filename: configResponse.data.logo })
              : configResponse.data.logo,
          };
          
          setConfiguracion(configuracionConLogoUrl);
          console.log('✅ Configuración recargada al validar token');
        } catch (error) {
          console.warn('⚠️ No se pudo cargar configuración:', error);
        }
      }
      
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
      // ✅ Generar URL completa del logo antes de guardar
      const configuracionConLogoUrl = {
        ...configuracion,
        logo: configuracion.logo && !configuracion.logo.startsWith('http')
          ? imagenesService.getImageUrl({ type: 'configuraciones', filename: configuracion.logo })
          : configuracion.logo,
      };
      
      // Guardar configuración y tema en Zustand
      setConfiguracion(configuracionConLogoUrl);

      console.log('✅ Configuración cargada:', configuracionConLogoUrl.nombreCliente);
      console.log('✅ Logo URL:', configuracionConLogoUrl.logo);

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
