import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subsedeService } from '@/services/subsede.service';
import type { GetSubsedesParams, CreateSubsedeDto, UpdateSubsedeDto } from '@/types/subsede.types';

export const subsedeKeys = {
  all: ['subsedes'] as const,
  lists: () => [...subsedeKeys.all, 'list'] as const,
  list: (params: GetSubsedesParams) => [...subsedeKeys.lists(), params] as const,
  details: () => [...subsedeKeys.all, 'detail'] as const,
  detail: (id: number) => [...subsedeKeys.details(), id] as const,
};

export const useSubsedes = (params: GetSubsedesParams) => {
  return useQuery({
    queryKey: subsedeKeys.list(params),
    queryFn: async () => {
      const response = await subsedeService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useSubsede = (id: number) => {
  return useQuery({
    queryKey: subsedeKeys.detail(id),
    queryFn: async () => {
      const response = await subsedeService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateSubsede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubsedeDto) => {
      const response = await subsedeService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subsedeKeys.lists() });
    },
  });
};

export const useUpdateSubsede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSubsedeDto }) => {
      const response = await subsedeService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subsedeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subsedeKeys.detail(variables.id) });
    },
  });
};

export const useDeleteSubsede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await subsedeService.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subsedeKeys.lists() });
    },
  });
};

/**
 * Hook para obtener subsedes disponibles para asignar accesos
 * Se adapta según el nivel del usuario:
 * - SUPER_ADMIN: Subsedes de la sede seleccionada o todas
 * - ESTATAL: Solo subsedes de su sede
 * - MUNICIPAL: No se usa (auto-asignado)
 */
export const useSubsedesForAccess = (
  userLevel: string,
  currentUserSedeId?: number,
  selectedSedeId?: number
) => {
  return useQuery({
    queryKey: ['subsedes-for-access', userLevel, currentUserSedeId, selectedSedeId],
    queryFn: async () => {
      const params: any = { activatePaginated: false };

      if (userLevel === 'ESTATAL') {
        params.sedeId = currentUserSedeId;
      } else if (userLevel === 'SUPER_ADMIN' && selectedSedeId) {
        params.sedeId = selectedSedeId;
      }

      const response = await subsedeService.getAll(params);
      return response.data.items || response.data;
    },
    enabled: userLevel === 'SUPER_ADMIN' || userLevel === 'ESTATAL',
  });
};
