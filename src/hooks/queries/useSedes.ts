import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sedeService } from '@/services/sede.service';
import type { GetSedesParams, CreateSedeDto, UpdateSedeDto } from '@/types/sede.types';

export const sedeKeys = {
  all: ['sedes'] as const,
  lists: () => [...sedeKeys.all, 'list'] as const,
  list: (params: GetSedesParams) => [...sedeKeys.lists(), params] as const,
  details: () => [...sedeKeys.all, 'detail'] as const,
  detail: (id: number) => [...sedeKeys.details(), id] as const,
};

export const useSedes = (params: GetSedesParams) => {
  return useQuery({
    queryKey: sedeKeys.list(params),
    queryFn: async () => {
      const response = await sedeService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useSede = (id: number) => {
  return useQuery({
    queryKey: sedeKeys.detail(id),
    queryFn: async () => {
      const response = await sedeService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateSede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSedeDto) => {
      const response = await sedeService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sedeKeys.lists() });
    },
  });
};

export const useUpdateSede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSedeDto }) => {
      const response = await sedeService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sedeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sedeKeys.detail(variables.id) });
    },
  });
};

export const useDeleteSede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await sedeService.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sedeKeys.lists() });
    },
  });
};
