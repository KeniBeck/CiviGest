import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/config/routes';

export const useAuth = () => {
  const navigate = useNavigate();
  const store = useAuthStore();

  /**
   * Login user with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        store.setLoading(true);

        const response = await authService.login(email, password);

        // Save user and token to store
        store.login(response.user, response.accessToken);

        // Navigate to dashboard
        navigate(ROUTES.DASHBOARD);

        return { success: true };
      } catch (error) {
        store.setLoading(false);

        if (error instanceof AxiosError) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Error al iniciar sesión';

          return { success: false, error: message };
        }

        return { success: false, error: 'Error inesperado al iniciar sesión' };
      }
    },
    [store, navigate]
  );

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    store.logout();
    navigate(ROUTES.LOGIN);
  }, [store, navigate]);

  /**
   * Validate current token
   */
  const validateToken = useCallback(async () => {
    try {
      if (!store.token) {
        return { valid: false };
      }

      const response = await authService.validateToken();

      if (!response.valid) {
        store.logout();
        return { valid: false };
      }

      return { valid: true };
    } catch (error) {
      store.logout();
      return { valid: false };
    }
  }, [store]);

  return {
    login,
    logout,
    validateToken,
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
  };
};
