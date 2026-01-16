import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patrullaService } from '@/services/patrulla.service';
import type { 
  GetPatrullaParams, 
  CreatePatrulla, 
  UpdatePatrulla 
} from '@/types/patrulla.type';

// ✅ Query Keys para caché de React Query
export const patrullaKeys = {
  all: ['patrullas'] as const,
  lists: () => [...patrullaKeys.all, 'list'] as const,
  list: (params: GetPatrullaParams) => [...patrullaKeys.lists(), params] as const,
  details: () => [...patrullaKeys.all, 'detail'] as const,
  detail: (id: number) => [...patrullaKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de patrullas con paginación y filtros
 */
export const usePatrullas = (params: GetPatrullaParams) => {
  return useQuery({
    queryKey: patrullaKeys.list(params),
    queryFn: async () => {
      const response = await patrullaService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook para obtener una patrulla por ID
 */
export const usePatrulla = (id: number) => {
  return useQuery({
    queryKey: patrullaKeys.detail(id),
    queryFn: async () => {
      const response = await patrullaService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

/**
 * Hook para crear una nueva patrulla
 */
export const useCreatePatrulla = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatrulla) => {
      const response = await patrullaService.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las listas de patrullas para que se refresquen
      queryClient.invalidateQueries({ queryKey: patrullaKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar una patrulla existente
 */
export const useUpdatePatrulla = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePatrulla }) => {
      const response = await patrullaService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar listas y el detalle específico de la patrulla actualizada
      queryClient.invalidateQueries({ queryKey: patrullaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patrullaKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar una patrulla (soft delete)
 */
export const useDeletePatrulla = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await patrullaService.delete(id);
    },
    onSuccess: () => {
      // Invalidar todas las listas para reflejar el cambio
      queryClient.invalidateQueries({ queryKey: patrullaKeys.lists() });
    },
  });
};

/**
 * Hook para restaurar una patrulla eliminada
 */
export const useRestorePatrulla = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await patrullaService.restore(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las listas para mostrar la patrulla restaurada
      queryClient.invalidateQueries({ queryKey: patrullaKeys.lists() });
    },
  });
};

/**
 * Hook para cambiar el estado activo/inactivo de una patrulla
 */
export const useToggleActivePatrulla = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await patrullaService.toggleActive(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      // Invalidar listas y el detalle específico
      queryClient.invalidateQueries({ queryKey: patrullaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patrullaKeys.detail(id) });
    },
  });
};
