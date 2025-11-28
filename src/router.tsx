import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';
import { ROUTES } from '@/config/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.HOME,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          // Agregar más rutas aquí cuando se creen los módulos
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
