import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/role.service';
import type { GetRolesParams, CreateRoleDto, UpdateRoleDto } from '@/types/role.types';

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: GetRolesParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

// ✅ Obtener todos los roles (paginado y con filtros)
export const useRoles = (params?: GetRolesParams) => {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const response = await roleService.getAll(params);
      return response.data;
    },
  });
};

// ✅ Obtener un rol por ID
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

// ✅ Crear un nuevo rol
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

// ✅ Actualizar un rol
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleDto }) =>
      roleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
    },
  });
};

// ✅ Eliminar un rol (soft delete)
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

// ✅ Activar/Desactivar un rol (toggle)
export const useToggleRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
};

// ========== PERMISOS ==========

// ✅ Obtener permisos de un rol
export const useRolePermissions = (roleId: number) => {
  return useQuery({
    queryKey: [...roleKeys.detail(roleId), 'permissions'],
    queryFn: async () => {
      const response = await roleService.getPermissions(roleId);
      return response.data;
    },
    enabled: !!roleId,
  });
};

// ✅ Asignar un permiso a un rol
export const useAssignPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      roleService.assignPermission(roleId, permissionId),
    onSuccess: (_, variables) => {
      // Invalidar la lista de roles para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: [...roleKeys.detail(variables.roleId), 'permissions'] });
    },
  });
};

// ✅ Asignar múltiples permisos
export const useAssignPermissionsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      roleService.assignPermissionsBulk(roleId, permissionIds),
    onSuccess: (_, variables) => {
      // Invalidar la lista de roles para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: [...roleKeys.detail(variables.roleId), 'permissions'] });
    },
  });
};

// ✅ Sincronizar permisos (reemplazar todos)
export const useSyncPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      roleService.syncPermissions(roleId, permissionIds),
    onSuccess: (_, variables) => {
      // Invalidar la lista de roles para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: [...roleKeys.detail(variables.roleId), 'permissions'] });
    },
  });
};

// ✅ Remover un permiso
export const useRemovePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      roleService.removePermission(roleId, permissionId),
    onSuccess: (_, variables) => {
      // Invalidar la lista de roles para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: [...roleKeys.detail(variables.roleId), 'permissions'] });
    },
  });
};

// ✅ Remover múltiples permisos
export const useRemovePermissionsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      roleService.removePermissionsBulk(roleId, permissionIds),
    onSuccess: (_, variables) => {
      // Invalidar la lista de roles para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: [...roleKeys.detail(variables.roleId), 'permissions'] });
      queryClient.invalidateQueries({ queryKey: [...roleKeys.detail(variables.roleId), 'permissions'] });
    },
  });
};
