import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { multasService } from '@/services/multas.service';
import type {
  CreateMultas,
  UpdateMultas,
  GetMultasParams,
} from '@/types/multas.type';

// Query Keys
export const multasKeys = {
  all: ['multas'] as const,
  lists: () => [...multasKeys.all, 'list'] as const,
  list: (params?: GetMultasParams) => [...multasKeys.lists(), params] as const,
  details: () => [...multasKeys.all, 'detail'] as const,
  detail: (id: number) => [...multasKeys.details(), id] as const,
};

// ✅ Hook para obtener todas las multas (paginado)
export const useMultas = (params?: GetMultasParams) => {
  return useQuery({
    queryKey: multasKeys.list(params),
    queryFn: () => multasService.getAll(params),
  });
};

// ✅ Hook para obtener una multa por ID
export const useMulta = (id: number) => {
  return useQuery({
    queryKey: multasKeys.detail(id),
    queryFn: () => multasService.getById(id),
    enabled: !!id,
  });
};

// ✅ Hook para crear una multa
export const useCreateMulta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMultas) => multasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multasKeys.lists() });
    },
  });
};

// ✅ Hook para actualizar una multa
export const useUpdateMulta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMultas }) =>
      multasService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: multasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: multasKeys.detail(variables.id) });
    },
  });
};

// ✅ Hook para eliminar una multa
export const useDeleteMulta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => multasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multasKeys.lists() });
    },
  });
};

// ✅ Hook para restaurar una multa
export const useRestoreMulta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => multasService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multasKeys.lists() });
    },
  });
};

// ✅ Hook para toggle active/inactive
export const useToggleMulta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => multasService.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: multasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: multasKeys.detail(id) });
    },
  });
};
