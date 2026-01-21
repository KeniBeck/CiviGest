import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {  GetPermissionsParams, CreatePermissionDto,UpdatePermissionDto, PaginatedPermissionsResponse } from '@/types/permission.type'
import { permissionService } from '@/services/permission.service';

export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (params?: GetPermissionsParams) => [...permissionKeys.lists(), params] as const,
  details: () => [...permissionKeys.all, 'detail'] as const,
  detail: (id: number) => [...permissionKeys.details(), id] as const,
};

// ✅ Obtener todos los permisos
export const usePermissions = (params?: GetPermissionsParams) => {
  return useQuery<PaginatedPermissionsResponse>({
    queryKey: permissionKeys.list(params),
    queryFn: async () => {
      const response = await permissionService.getAll(params);
      return response.data;
    },
  });
};

// ✅ Obtener un permiso por ID
export const usePermission = (id: number) => {
  return useQuery({
    queryKey: permissionKeys.detail(id),
    queryFn: async () => {
      const response = await permissionService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// ✅ Crear permiso
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePermissionDto) => permissionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
};

// ✅ Actualizar permiso
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionDto }) =>
      permissionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.details() });
    },
  });
};

// ✅ Activar permiso
export const useActivatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.details() });
    },
  });
};

// ✅ Desactivar permiso
export const useDeactivatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.details() });
    },
  });
};

// ✅ Eliminar permiso
export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
};
