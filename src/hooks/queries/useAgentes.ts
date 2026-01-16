import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agenteService } from '@/services/agente.service';
import type { 
  GetAgentesParams, 
  CreateAgente, 
  UpdateAgente 
} from '@/types/agente.type';

// ✅ Query Keys para caché de React Query
export const agenteKeys = {
  all: ['agentes'] as const,
  lists: () => [...agenteKeys.all, 'list'] as const,
  list: (params: GetAgentesParams) => [...agenteKeys.lists(), params] as const,
  details: () => [...agenteKeys.all, 'detail'] as const,
  detail: (id: number) => [...agenteKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de agentes con paginación y filtros
 */
export const useAgentes = (params: GetAgentesParams) => {
  return useQuery({
    queryKey: agenteKeys.list(params),
    queryFn: async () => {
      const response = await agenteService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook para obtener un agente por ID
 */
export const useAgente = (id: number) => {
  return useQuery({
    queryKey: agenteKeys.detail(id),
    queryFn: async () => {
      const response = await agenteService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

/**
 * Hook para crear un nuevo agente
 */
export const useCreateAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgente) => {
      const response = await agenteService.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las listas de agentes para que se refresquen
      queryClient.invalidateQueries({ queryKey: agenteKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un agente existente
 */
export const useUpdateAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAgente }) => {
      const response = await agenteService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar listas y el detalle específico del agente actualizado
      queryClient.invalidateQueries({ queryKey: agenteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agenteKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar un agente (soft delete)
 */
export const useDeleteAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await agenteService.delete(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar listas para refrescar
      queryClient.invalidateQueries({ queryKey: agenteKeys.lists() });
    },
  });
};

/**
 * Hook para restaurar un agente eliminado
 */
export const useRestoreAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await agenteService.restore(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: agenteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agenteKeys.detail(id) });
    },
  });
};

/**
 * Hook para cambiar el estado activo/inactivo de un agente
 */
export const useToggleActiveAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await agenteService.toggleActive(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: agenteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agenteKeys.detail(id) });
    },
  });
};

/**
 * Hook para subir foto de agente
 */
export const useUploadFotoAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const response = await agenteService.uploadFoto(id, file);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar el detalle del agente para que se actualice la foto
      queryClient.invalidateQueries({ queryKey: agenteKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: agenteKeys.lists() });
    },
  });
};
