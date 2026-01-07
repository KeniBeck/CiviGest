import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  navigationMenu,
  type MenuItem,
  type RoleLevel,
} from '@/config/navigation';

// Mapear roles del backend a RoleLevel
const mapRoleToLevel = (roleName: string): RoleLevel => {
  if (roleName.toLowerCase().includes('super')) return 'SUPER_ADMIN';
  if (roleName.toLowerCase().includes('estatal')) return 'ESTATAL';
  if (roleName.toLowerCase().includes('municipal')) return 'MUNICIPAL';
  return 'OPERATIVO';
};

// Filtrar menú según permisos del usuario
const filterMenuByPermissions = (
  items: MenuItem[],
  userRoles: RoleLevel[]
): MenuItem[] => {
  return items.reduce((acc, item) => {
    // Si el item tiene restricción de roles
    if (item.roles && item.roles.length > 0) {
      // Verificar si el usuario tiene alguno de los roles permitidos
      const hasPermission = item.roles.some((role) => userRoles.includes(role));
      if (!hasPermission) return acc;
    }

    // Si tiene children, filtrarlos recursivamente
    if (item.children) {
      const filteredChildren = filterMenuByPermissions(item.children, userRoles);

      // Solo incluir el parent si tiene children visibles
      if (filteredChildren.length > 0) {
        acc.push({ ...item, children: filteredChildren });
      }
    } else {
      acc.push(item);
    }

    return acc;
  }, [] as MenuItem[]);
};

export const useNavigation = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Obtener roles del usuario
  const userRoles = useMemo(() => {
    if (!user?.roles) return ['OPERATIVO'] as RoleLevel[];
    return user.roles.map(mapRoleToLevel);
  }, [user]);

  // Filtrar menú según roles
  const filteredMenu = useMemo(() => {
    return filterMenuByPermissions(navigationMenu, userRoles);
  }, [userRoles]);

  // Verificar si una ruta está activa
  const isActive = (path?: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return {
    menu: filteredMenu,
    currentPath: location.pathname,
    isActive,
    userRoles,
  };
};
