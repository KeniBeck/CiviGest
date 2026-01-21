import type { CreatePermissionDto, GetPermissionsParams, Permission, UpdatePermissionDto, PaginatedPermissionsResponse } from '@/types/permission.type';
import { api } from './api';

export const permissionService = {
  // Obtener todos los permisos
  getAll: async (params?: GetPermissionsParams) => {
    const response = await api.get<PaginatedPermissionsResponse>('/permissions', { params });
    return response;
  },

  // Obtener un permiso por ID
  getById: async (id: number) => {
    const response = await api.get<Permission>(`/permissions/${id}`);
    return response;
  },

  // Crear un nuevo permiso
  create: async (data: CreatePermissionDto) => {
    const response = await api.post<Permission>('/permissions', data);
    return response;
  },

  // Actualizar un permiso
  update: async (id: number, data: UpdatePermissionDto) => {
    const response = await api.put<Permission>(`/permissions/${id}`, data);
    return response;
  },

  // Activar un permiso
  activate: async (id: number) => {
    const response = await api.patch<Permission>(`/permissions/${id}/activate`);
    return response;
  },

  // Desactivar un permiso
  deactivate: async (id: number) => {
    const response = await api.patch<Permission>(`/permissions/${id}/deactivate`);
    return response;
  },

  // Eliminar un permiso
  delete: async (id: number) => {
    await api.delete(`/permissions/${id}`);
  },
};
