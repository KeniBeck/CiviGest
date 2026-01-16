import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permisoService } from '@/services/permiso.service';
import type { 
  GetPermisosParams, 
  CreatePermiso, 
  UpdatePermiso 
} from '@/types/permiso.type';

// ✅ Query Keys para caché de React Query
export const permisoKeys = {
  all: ['permisos'] as const,
  lists: () => [...permisoKeys.all, 'list'] as const,
  list: (params: GetPermisosParams) => [...permisoKeys.lists(), params] as const,
  details: () => [...permisoKeys.all, 'detail'] as const,
  detail: (id: number) => [...permisoKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de permisos con paginación y filtros
 */
export const usePermisos = (params: GetPermisosParams) => {
  return useQuery({
    queryKey: permisoKeys.list(params),
    queryFn: async () => {
      const response = await permisoService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook para obtener un permiso por ID
 */
export const usePermiso = (id: number) => {
  return useQuery({
    queryKey: permisoKeys.detail(id),
    queryFn: async () => {
      const response = await permisoService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

/**
 * Hook para crear un nuevo permiso
 */
export const useCreatePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePermiso) => {
      const response = await permisoService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un permiso existente
 */
export const useUpdatePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePermiso }) => {
      const response = await permisoService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permisoKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar un permiso (soft delete)
 */
export const useDeletePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await permisoService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.lists() });
    },
  });
};

/**
 * Hook para restaurar un permiso eliminado
 */
export const useRestorePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await permisoService.restore(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.lists() });
    },
  });
};

/**
 * Hook para cambiar el estado activo/inactivo de un permiso
 */
export const useToggleActivePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await permisoService.toggleActive(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permisoKeys.detail(id) });
    },
  });
};

/**
 * Hook para aprobar un permiso
 */
export const useAprobarPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, observaciones }: { id: number; observaciones?: string }) => {
      const response = await permisoService.aprobar(id, observaciones);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permisoKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para rechazar un permiso
 */
export const useRechazarPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivoRechazo }: { id: number; motivoRechazo: string }) => {
      const response = await permisoService.rechazar(id, motivoRechazo);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permisoKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para generar QR de un permiso
 */
export const useGenerarQRPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await permisoService.generarQR(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: permisoKeys.detail(id) });
    },
  });
};
