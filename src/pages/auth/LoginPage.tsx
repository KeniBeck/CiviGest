import { Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { useDefaultTheme } from '@/hooks/queries/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();

  // React Query carga el tema default automáticamente
  const { isLoading } = useDefaultTheme();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
