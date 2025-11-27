import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';
import { ROUTES } from '@/config/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
