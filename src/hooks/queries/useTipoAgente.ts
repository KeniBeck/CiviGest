import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tipoAgenteService } from '@/services/tipo-agente.service';
import type {
  CreateTipoAgente,
  UpdateTipoAgente,
  GetTipoAgenteParams,
} from '@/types/tipo-agente.type';

// Query Keys
export const tipoAgenteKeys = {
  all: ['tipo-agentes'] as const,
  lists: () => [...tipoAgenteKeys.all, 'list'] as const,
  list: (params?: GetTipoAgenteParams) => [...tipoAgenteKeys.lists(), params] as const,
  details: () => [...tipoAgenteKeys.all, 'detail'] as const,
  detail: (id: number) => [...tipoAgenteKeys.details(), id] as const,
};

// ✅ Hook para obtener todos los tipos de agente (paginado)
export const useTipoAgentes = (params?: GetTipoAgenteParams) => {
  return useQuery({
    queryKey: tipoAgenteKeys.list(params),
    queryFn: () => tipoAgenteService.getAll(params),
  });
};

// ✅ Hook para obtener un tipo de agente por ID
export const useTipoAgente = (id: number) => {
  return useQuery({
    queryKey: tipoAgenteKeys.detail(id),
    queryFn: () => tipoAgenteService.getById(id),
    enabled: !!id,
  });
};

// ✅ Hook para crear un tipo de agente
export const useCreateTipoAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTipoAgente) => tipoAgenteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoAgenteKeys.lists() });
    },
  });
};

// ✅ Hook para actualizar un tipo de agente
export const useUpdateTipoAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTipoAgente }) =>
      tipoAgenteService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tipoAgenteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tipoAgenteKeys.detail(variables.id) });
    },
  });
};

// ✅ Hook para eliminar un tipo de agente
export const useDeleteTipoAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tipoAgenteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoAgenteKeys.lists() });
    },
  });
};

// ✅ Hook para restaurar un tipo de agente
export const useRestoreTipoAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tipoAgenteService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoAgenteKeys.lists() });
    },
  });
};

// ✅ Hook para toggle active/inactive
export const useToggleTipoAgente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tipoAgenteService.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: tipoAgenteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tipoAgenteKeys.detail(id) });
    },
  });
};
