import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import UsersPage from "@/pages/users/UsersPage";
import SedesPage from "@/pages/sedes/SedesPage";
import SubsedesPage from "@/pages/subsedes/SubsedesPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/features/auth/ProtectedRoute";
import { ROUTES } from "@/config/routes";
import { AgentesPage } from "./pages/agente/AgentesPage";
import { PatrullaPage } from "./pages/patrulla/PatrullaPage";
import { TipoPermisoPage } from "./pages/tipo-permiso/TipoPermisoPage";
import { PermisoPage } from "./pages/permiso/PermisoPage";
import { TipoAgentePage } from "./pages/tipo-agente/TipoAgentePage";

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
            path: "/users",
            element: <UsersPage />,
          },
          {
            path: "/permisos",
            element: <PermisoPage />,
          },
          {
            path: "/tipos-permiso",
            element: <TipoPermisoPage />,
          },
          {
            path: "/tipos-agente",
            element: <TipoAgentePage />,
          },
          {
            path: "/agentes",
            element: <AgentesPage />,
          },
          {
            path: "/patrullas",
            element: <PatrullaPage />,
          },
          {
            path: "/sedes",
            element: <SedesPage />,
          },
          {
            path: "/subsedes",
            element: <SubsedesPage />,
          },
          // Agregar más rutas aquí cuando se creen los módulos
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
