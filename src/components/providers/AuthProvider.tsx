import type { ReactNode } from 'react';
import { useValidateToken } from '@/hooks/queries/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { token } = useAuthStore();

  // Validar token si existe (React Query lo maneja)
  const { isLoading } = useValidateToken();

  // Aplicar tema a CSS
  useTheme();

  // Mostrar splash SOLO si hay token Y está validando
  if (token && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium dark:text-gray-300">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
