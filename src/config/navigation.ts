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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RoleLevel = 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  path?: string;
  roles?: RoleLevel[]; // Si no se especifica, todos pueden ver
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
        roles: ['MUNICIPAL', 'SUPER_ADMIN'],
      },
      {
        label: 'Estados',
        icon: Map,
        path: '/sedes',
        roles: ['SUPER_ADMIN'],
      },
      {
        label: 'Municipios',
        icon: MapPin,
        path: '/subsedes',
        roles: ['SUPER_ADMIN', 'ESTATAL'],
      },
      {
        label: 'Temas',
        icon: Palette,
        path: '/themes',
        roles: ['SUPER_ADMIN'],
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
      },
      {
        label: 'Departamentos',
        icon: Building,
        path: '/departamentos',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
      },
      {
        label: 'Tipos de Agente',
        icon: UserCog,
        path: '/tipos-agente',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
      },
      {
        label: 'Tipos de Permiso',
        icon: FileText,
        path: '/tipos-permiso',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
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
      },
      {
        label: 'Patrullas',
        icon: Car,
        path: '/patrullas',
        roles: ['MUNICIPAL', 'SUPER_ADMIN', 'ESTATAL'],
      },
      {
        label: 'Infracciones',
        icon: AlertTriangle,
        path: '/infracciones',
      },
      {
        label: 'Permisos',
        icon: FileCheck,
        path: '/permisos',
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
      },
      {
        label: 'Roles',
        icon: ShieldCheck,
        path: '/roles',
        roles: ['SUPER_ADMIN','MUNICIPAL','ESTATAL'],
      },
    ],
  },
];
