import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';

export type UserLevel = 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';

/**
 * Hook para determinar el nivel jerárquico del usuario autenticado
 */
export const useUserLevel = () => {
  const currentUser = useAuthStore((state) => state.user);

  const userLevel: UserLevel = useMemo(() => {
    if (!currentUser?.roles || currentUser.roles.length === 0) return 'OPERATIVO';
    
    const roleString = currentUser.roles[0];
    if (roleString.toLowerCase().includes('super')) return 'SUPER_ADMIN';
    if (roleString.toLowerCase().includes('estatal')) return 'ESTATAL';
    if (roleString.toLowerCase().includes('municipal')) return 'MUNICIPAL';
    
    return 'OPERATIVO';
  }, [currentUser]);

  return {
    userLevel,
    currentUser,
    canEditSede: userLevel === 'SUPER_ADMIN',
    canEditSubsede: userLevel !== 'MUNICIPAL',
    canEditAccessLevel: userLevel !== 'MUNICIPAL',
  };
};
