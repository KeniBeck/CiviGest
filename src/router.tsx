import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import UsersPage from "@/pages/users/UsersPage";
import SedesPage from "@/pages/sedes/SedesPage";
import SubsedesPage from "@/pages/subsedes/SubsedesPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/features/auth/ProtectedRoute";
import { ROUTES } from "@/config/routes";
import { AgentesPage } from "./pages/agente/AgentesPage";
import { PatrullaPage } from "./pages/patrulla/PatrullaPage";
import { TipoPermisoPage } from "./pages/tipo-permiso/TipoPermisoPage";
import { PermisoPage } from "./pages/permiso/PermisoPage";
import { TipoAgentePage } from "./pages/tipo-agente/TipoAgentePage";
import { DepartamentoPage } from "./pages/departamento/DepartamentoPage";
import { MultasPage } from "./pages/multas/MultasPage";
import { ConfiguracionPage } from "./pages/configuracion/ConfiguracionPage";
import RolePage from "./pages/role/RolePage";
import PermissionsPage from "./pages/permission/PermissionsPage";
import ComprobantePublico from "./pages/comprobante/ComprobantePublico";

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  // Ruta pública para comprobantes
  {
    path: "/comprobante-permisos",
    element: <ComprobantePublico />,
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
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
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
            path: "/departamentos",
            element: <DepartamentoPage />,
          },
          {
            path: "/multas",
            element: <MultasPage />,
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
          {
            path: "/roles",
            element: <RolePage />,
          },
          {
            path: "/permissions",
            element: <PermissionsPage />,
          },
          {
            path: "/configuracion",
            element: <ConfiguracionPage />,
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
