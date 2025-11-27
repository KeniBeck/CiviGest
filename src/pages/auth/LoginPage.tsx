import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
