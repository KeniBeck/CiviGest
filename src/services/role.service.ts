import { api } from './api';
import type { Role, GetRolesParams } from '@/types/role.types';
import type { PaginatedResponse } from '@/types/api.types';

export const roleService = {
  getAll: async (params?: GetRolesParams) => {
    const response = await api.get<PaginatedResponse<Role>>('/roles', { params });
    return response;
  },

  getById: async (id: number) => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response;
  },
};
