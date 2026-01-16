import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import UsersPage from '@/pages/users/UsersPage';
import SedesPage from '@/pages/sedes/SedesPage';
import SubsedesPage from '@/pages/subsedes/SubsedesPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';
import { ROUTES } from '@/config/routes';
import { AgentesPage } from './pages/agente/AgentesPage';

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
          {
            path: '/users',
            element: <UsersPage />,
          },
          {
            path: '/agentes',
            element: <AgentesPage/>

          },
          {
            path: '/sedes',
            element: <SedesPage />,
          },
          {
            path: '/subsedes',
            element: <SubsedesPage />,
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
