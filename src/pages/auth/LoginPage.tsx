import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';

export function LoginPage() {
  const { isAuthenticated, validateToken } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidated = useRef(false);

  useEffect(() => {
    // Solo validar una vez al montar el componente
    if (hasValidated.current) return;

    const checkAuth = async () => {
      if (isAuthenticated) {
        // Validate token before redirecting
        const result = await validateToken();

        if (result.valid) {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
      }
      setIsValidating(false);
      hasValidated.current = true;
    };

    checkAuth();
  }, [isAuthenticated, validateToken, navigate]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-50 mx-auto"></div>
          <p className="mt-4 text-sm text-zinc-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
