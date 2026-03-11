import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { infraccionService } from '@/services/infraccion.service';
import type {
  FilterInfraccionesDto,
  CreateInfraccionDto,
  UpdateInfraccionDto,
} from '@/types/infraccion.type';

export const infraccionKeys = {
  all: ['infracciones'] as const,
  lists: () => [...infraccionKeys.all, 'list'] as const,
  list: (params: FilterInfraccionesDto) => [...infraccionKeys.lists(), params] as const,
  details: () => [...infraccionKeys.all, 'detail'] as const,
  detail: (id: number) => [...infraccionKeys.details(), id] as const,
};

export const useInfracciones = (params?: FilterInfraccionesDto) => {
  return useQuery({
    queryKey: infraccionKeys.list(params ?? {}),
    queryFn: async () => {
      const response = await infraccionService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useInfraccion = (id: number) => {
  return useQuery({
    queryKey: infraccionKeys.detail(id),
    queryFn: async () => {
      const response = await infraccionService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

export const useCreateInfraccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInfraccionDto) => {
      const response = await infraccionService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: infraccionKeys.lists() });
    },
  });
};

export const useUpdateInfraccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateInfraccionDto }) => {
      const response = await infraccionService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: infraccionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infraccionKeys.detail(variables.id) });
    },
  });
};

export const useDeleteInfraccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await infraccionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: infraccionKeys.lists() });
    },
  });
};

export const useEstadisticasInfracciones = (params?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: [...infraccionKeys.all, 'estadisticas', params],
    queryFn: async () => {
      const response = await infraccionService.getEstadisticas(params);
      return response.data;
    },
  });
};
