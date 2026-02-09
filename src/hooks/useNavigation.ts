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

// Filtrar menú según permisos y roles del usuario
const filterMenuByPermissions = (
  items: MenuItem[],
  userRoles: RoleLevel[],
  userPermissions: string[]
): MenuItem[] => {
  return items.reduce((acc, item) => {
    let hasAccess = false;

    // Si el item tiene restricción de roles, verificar roles
    const hasRoleAccess = item.roles && item.roles.length > 0
      ? item.roles.some((role) => userRoles.includes(role))
      : false;

    // Si tiene permisos requeridos, verificar que el usuario tenga al menos uno
    const hasPermissionAccess = item.permissions && item.permissions.length > 0
      ? item.permissions.some((permission) => userPermissions.includes(permission))
      : false;

    // Si tiene roles definidos Y cumple con el rol, tiene acceso
    // O si tiene permisos definidos Y cumple con algún permiso, tiene acceso
    // Si no tiene ni roles ni permisos definidos, todos tienen acceso
    if (item.roles && item.roles.length > 0) {
      hasAccess = hasRoleAccess;
    } else if (item.permissions && item.permissions.length > 0) {
      hasAccess = hasPermissionAccess;
    } else {
      hasAccess = true; // Sin restricciones
    }

    if (!hasAccess) return acc;

    // Si tiene children, filtrarlos recursivamente
    if (item.children) {
      const filteredChildren = filterMenuByPermissions(
        item.children,
        userRoles,
        userPermissions
      );

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
  const { user, isAgente } = useAuthStore();
  const location = useLocation();

  // Obtener roles del usuario
  const userRoles = useMemo(() => {
    if (!user?.roles) return ['OPERATIVO'] as RoleLevel[];
    
    // Si es agente, los roles vienen como string[]
    if (isAgente) {
      return user.roles.map((role: string) => mapRoleToLevel(role));
    }
    
    // Si es usuario normal, los roles vienen con estructura completa
    return user.roles.map((r: any) => mapRoleToLevel(r.role?.name || r));
  }, [user, isAgente]);

  // Obtener permisos del usuario
  const userPermissions = useMemo(() => {
    if (!user) return [];
    
    // Si es agente, usar directamente el array de permisos
    if (isAgente && user.permissions) {
      return user.permissions;
    }
    
    // Si es usuario normal, extraer permisos de los roles
    // (asumiendo que los usuarios tienen permisos a través de roles)
    return [];
  }, [user, isAgente]);

  // Filtrar menú según roles y permisos
  const filteredMenu = useMemo(() => {
    return filterMenuByPermissions(navigationMenu, userRoles, userPermissions);
  }, [userRoles, userPermissions]);

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
    userPermissions,
  };
};
