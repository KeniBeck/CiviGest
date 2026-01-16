import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/role.service';
import type { GetRolesParams } from '@/types/role.types';

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: GetRolesParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

export const useRoles = (params?: GetRolesParams) => {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const response = await roleService.getAll(params);
      return response.data;
    },
  });
};

export const useRole = (id: number) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const response = await roleService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};
