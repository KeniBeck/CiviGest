import {
  LayoutDashboard,
  Settings,
  Building2,
  Map,
  MapPin,
  Palette,
  BookOpen,
  Receipt,
  Building,
  UserCog,
  FileText,
  Activity,
  Users,
  Car,
  AlertTriangle,
  FileCheck,
  Shield,
  ShieldCheck,
  Key,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RoleLevel = 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  path?: string;
  roles?: RoleLevel[]; // Si no se especifica, todos pueden ver
  permissions?: string[]; // Permisos específicos requeridos (para agentes)
  children?: MenuItem[];
}

export const navigationMenu: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Configuración',
    icon: Settings,
    children: [
      {
        label: 'Mi Municipio',
        icon: Building2,
        path: '/configuracion',
        roles: ['MUNICIPAL', 'SUPER_ADMIN','ESTATAL'],
        permissions: ['configuraciones:read'],
      },
      {
        label: 'Estados',
        icon: Map,
        path: '/sedes',
        roles: ['SUPER_ADMIN'],
        permissions: ['sedes:read'],
      },
      {
        label: 'Municipios',
        icon: MapPin,
        path: '/subsedes',
        roles: ['SUPER_ADMIN', 'ESTATAL'],
        permissions: ['subsedes:read'],
      },
      {
        label: 'Temas',
        icon: Palette,
        path: '/themes',
        roles: ['SUPER_ADMIN'],
        permissions: ['themes:read'],
      },
    ],
  },
  {
    label: 'Catálogos',
    icon: BookOpen,
    children: [
      {
        label: 'Multas',
        icon: Receipt,
        path: '/multas',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['multas:read'],
      },
      {
        label: 'Departamentos',
        icon: Building,
        path: '/departamentos',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['departamentos:read'],
      },
      {
        label: 'Tipos de Agente',
        icon: UserCog,
        path: '/tipos-agente',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['tipos-agente:read'],
      },
      {
        label: 'Tipos de Permiso',
        icon: FileText,
        path: '/tipos-permiso',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['tipos-permiso:read'],
      },
    ],
  },
  {
    label: 'Operaciones',
    icon: Activity,
    children: [
      {
        label: 'Agentes',
        icon: Users,
        path: '/agentes',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['agentes:read'],
      },
      {
        label: 'Patrullas',
        icon: Car,
        path: '/patrullas',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['patrullas:read'],
      },
      {
        label: 'Infracciones',
        icon: AlertTriangle,
        path: '/infracciones',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['infraccion:read'],
      },
      {
        label: 'Permisos',
        icon: FileCheck,
        path: '/permisos',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
        permissions: ['permisos:read'],
      },
    ],
  },
  {
    label: 'Administración',
    icon: Shield,
    roles: ['SUPER_ADMIN', 'MUNICIPAL', 'ESTATAL'],
    children: [
      {
        label: 'Usuarios',
        icon: Users,
        path: '/users',
        roles: ['SUPER_ADMIN', 'MUNICIPAL', 'ESTATAL'],
        permissions: ['users:read'],
      },
      {
        label: 'Roles',
        icon: ShieldCheck,
        path: '/roles',
        roles: ['SUPER_ADMIN','MUNICIPAL','ESTATAL'],
        permissions: ['roles:read'],
      },
      {
        label: 'Permisos',
        icon: Key,
        path: '/permissions',
        roles: ['SUPER_ADMIN'],
        permissions: ['permissions:read'],
      },
    ],
  },
];
