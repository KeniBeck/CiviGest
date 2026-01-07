import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-50 mx-auto"></div>
          <p className="mt-4 text-sm text-zinc-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Token validation is handled by axios interceptor (401 response)
  return <Outlet />;
}
