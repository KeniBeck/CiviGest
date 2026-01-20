import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracionService } from '@/services/configuracion.service';
import type { 
  CreateConfiguracionDto, 
  UpdateConfiguracionDto 
} from '@/types/configuracion.types';

// ✅ Query Keys para caché de React Query
export const configuracionKeys = {
  all: ['configuraciones'] as const,
  bySubsede: (subsedeId: number) => [...configuracionKeys.all, 'subsede', subsedeId] as const,
  detail: (id: number) => [...configuracionKeys.all, 'detail', id] as const,
};

/**
 * Hook para obtener la configuración por subsede ID
 */
export const useConfiguracionBySubsede = (subsedeId: number) => {
  return useQuery({
    queryKey: configuracionKeys.bySubsede(subsedeId),
    queryFn: async () => {
      const response = await configuracionService.getBySubsede(subsedeId);
      return response.data;
    },
    enabled: !!subsedeId && subsedeId > 0,
  });
};

/**
 * Hook para obtener una configuración por ID
 */
export const useConfiguracion = (id: number) => {
  return useQuery({
    queryKey: configuracionKeys.detail(id),
    queryFn: async () => {
      const response = await configuracionService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

/**
 * Hook para crear una nueva configuración
 */
export const useCreateConfiguracion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConfiguracionDto) => {
      const response = await configuracionService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionKeys.all });
    },
  });
};

/**
 * Hook para actualizar una configuración existente
 */
export const useUpdateConfiguracion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateConfiguracionDto }) => {
      const response = await configuracionService.update(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: configuracionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: configuracionKeys.bySubsede(data.subsedeId) });
    },
  });
};

/**
 * Hook para eliminar una configuración (soft delete)
 */
export const useDeleteConfiguracion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await configuracionService.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionKeys.all });
    },
  });
};

/**
 * Hook para cambiar el estado activo/inactivo
 */
export const useToggleActiveConfiguracion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await configuracionService.toggleActive(id);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: configuracionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: configuracionKeys.bySubsede(data.subsedeId) });
    },
  });
};

/**
 * Hook para subir logo de configuración
 */
export const useUploadLogoConfiguracion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const response = await configuracionService.uploadLogo(id, file);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: configuracionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: configuracionKeys.all });
    },
  });
};
