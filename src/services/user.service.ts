import { api } from './api';
import type {
  User,
  GetUsersParams,
  CreateUserDto,
  UpdateUserDto,
} from '@/types/user.types';
import type { PaginatedResponse } from '@/types/api.types';

export const userService = {
  // ✅ IMPORTANTE: Usar /users/paginated para lista
  getAll: async (params: GetUsersParams) => {
    const response = await api.get<PaginatedResponse<User>>(
      '/users/paginated',
      { params }
    );
    return response;
  },

  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response;
  },

  create: async (data: CreateUserDto) => {
    const response = await api.post<User>('/users', data);
    return response;
  },

  update: async (id: number, data: UpdateUserDto) => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },
};
