import { api } from './api';
import type { Role, GetRolesParams, CreateRoleDto, UpdateRoleDto } from '@/types/role.types';
import type { PaginatedResponse } from '@/types/api.types';

export const roleService = {
  // Obtener todos los roles (con paginación y filtros)
  getAll: async (params?: GetRolesParams) => {
    const response = await api.get<PaginatedResponse<Role>>('/roles', { params });
    return response;
  },

  // Obtener un rol por ID
  getById: async (id: number) => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response;
  },

  // Crear un nuevo rol
  create: async (data: CreateRoleDto) => {
    const response = await api.post<Role>('/roles', data);
    return response;
  },

  // Actualizar un rol
  update: async (id: number, data: UpdateRoleDto) => {
    const response = await api.patch<Role>(`/roles/${id}`, data);
    return response;
  },

  // Eliminar un rol (soft delete)
  delete: async (id: number) => {
    const response = await api.delete<void>(`/roles/${id}`);
    return response;
  },

  // Activar/Desactivar un rol (toggle)
  toggleActive: async (id: number) => {
    const response = await api.patch<Role>(`/roles/${id}/toggle`);
    return response;
  },

  // ========== PERMISOS ==========

  // Obtener permisos de un rol
  getPermissions: async (id: number) => {
    const response = await api.get(`/roles/${id}/permissions`);
    return response;
  },

  // Asignar un permiso a un rol
  assignPermission: async (roleId: number, permissionId: number) => {
    const response = await api.post(`/roles/${roleId}/permissions`, { permissionId });
    return response;
  },

  // Asignar múltiples permisos a un rol
  assignPermissionsBulk: async (roleId: number, permissionIds: number[]) => {
    const response = await api.post(`/roles/${roleId}/permissions/bulk`, { permissionIds });
    return response;
  },

  // Sincronizar permisos (reemplazar todos)
  syncPermissions: async (roleId: number, permissionIds: number[]) => {
    const response = await api.put(`/roles/${roleId}/permissions/sync`, { permissionIds });
    return response;
  },

  // Remover un permiso de un rol
  removePermission: async (roleId: number, permissionId: number) => {
    const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return response;
  },

  // Remover múltiples permisos de un rol
  removePermissionsBulk: async (roleId: number, permissionIds: number[]) => {
    const response = await api.delete(`/roles/${roleId}/permissions/bulk`, { data: { permissionIds } });
    return response;
  },
};
