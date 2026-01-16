import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tipoPermisoService } from '@/services/tipo-permiso.service';
import type { 
  GetTipoPermisoParams, 
  CreateTipoPermiso, 
  UpdateTipoPermiso 
} from '@/types/tipoPermiso.type';

// ✅ Query Keys para caché de React Query
export const tipoPermisoKeys = {
  all: ['tipo-permisos'] as const,
  lists: () => [...tipoPermisoKeys.all, 'list'] as const,
  list: (params: GetTipoPermisoParams) => [...tipoPermisoKeys.lists(), params] as const,
  details: () => [...tipoPermisoKeys.all, 'detail'] as const,
  detail: (id: number) => [...tipoPermisoKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de tipos de permiso con paginación y filtros
 */
export const useTipoPermisos = (params: GetTipoPermisoParams) => {
  return useQuery({
    queryKey: tipoPermisoKeys.list(params),
    queryFn: async () => {
      const response = await tipoPermisoService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook para obtener un tipo de permiso por ID
 */
export const useTipoPermiso = (id: number) => {
  return useQuery({
    queryKey: tipoPermisoKeys.detail(id),
    queryFn: async () => {
      const response = await tipoPermisoService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

/**
 * Hook para crear un nuevo tipo de permiso
 */
export const useCreateTipoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTipoPermiso) => {
      const response = await tipoPermisoService.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las listas de tipos de permiso para que se refresquen
      queryClient.invalidateQueries({ queryKey: tipoPermisoKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un tipo de permiso existente
 */
export const useUpdateTipoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTipoPermiso }) => {
      const response = await tipoPermisoService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar listas y el detalle específico del tipo de permiso actualizado
      queryClient.invalidateQueries({ queryKey: tipoPermisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tipoPermisoKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar un tipo de permiso (soft delete)
 */
export const useDeleteTipoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await tipoPermisoService.delete(id);
    },
    onSuccess: () => {
      // Invalidar todas las listas para reflejar el cambio
      queryClient.invalidateQueries({ queryKey: tipoPermisoKeys.lists() });
    },
  });
};

/**
 * Hook para restaurar un tipo de permiso eliminado
 */
export const useRestoreTipoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await tipoPermisoService.restore(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las listas para mostrar el tipo de permiso restaurado
      queryClient.invalidateQueries({ queryKey: tipoPermisoKeys.lists() });
    },
  });
};

/**
 * Hook para cambiar el estado activo/inactivo de un tipo de permiso
 */
export const useToggleActiveTipoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await tipoPermisoService.toggleActive(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      // Invalidar listas y el detalle específico
      queryClient.invalidateQueries({ queryKey: tipoPermisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tipoPermisoKeys.detail(id) });
    },
  });
};
