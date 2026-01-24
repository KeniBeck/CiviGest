import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagenesService } from '@/services/imagenes.service';
import type { 
  ImageType,
  UploadImageParams,
  ReplaceImageParams,
  GetImageParams,
  DeleteImageParams,
  GetImagesByEntityParams,
  GetLatestImageParams,
} from '@/types/imagenes.type';

// ✅ Query Keys para caché de React Query
export const imagenesKeys = {
  all: ['imagenes'] as const,
  lists: () => [...imagenesKeys.all, 'list'] as const,
  list: (type: ImageType) => [...imagenesKeys.lists(), type] as const,
  entity: (type: ImageType, id: number) => [...imagenesKeys.all, 'entity', type, id] as const,
  latest: (type: ImageType, id: number, subId?: number) => 
    [...imagenesKeys.all, 'latest', type, id, subId] as const,
  metadata: (type: ImageType, filename: string) => 
    [...imagenesKeys.all, 'metadata', type, filename] as const,
};

/**
 * Hook para subir una nueva imagen
 */
export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadImageParams) => {
      // Validar archivo antes de subir
      const validation = imagenesService.validateImageFile(params.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await imagenesService.uploadImage(params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar cachés relevantes
      queryClient.invalidateQueries({ 
        queryKey: imagenesKeys.list(variables.type) 
      });
      queryClient.invalidateQueries({ 
        queryKey: imagenesKeys.entity(variables.type, variables.id) 
      });
      if (variables.subId) {
        queryClient.invalidateQueries({ 
          queryKey: imagenesKeys.latest(variables.type, variables.id, variables.subId) 
        });
      }
    },
  });
};

/**
 * Hook para reemplazar una imagen existente
 */
export const useReplaceImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReplaceImageParams) => {
      // Validar archivo antes de subir
      const validation = imagenesService.validateImageFile(params.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await imagenesService.replaceImage(params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar cachés relevantes
      queryClient.invalidateQueries({ 
        queryKey: imagenesKeys.list(variables.type) 
      });
      queryClient.invalidateQueries({ 
        queryKey: imagenesKeys.entity(variables.type, variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: imagenesKeys.metadata(variables.type, variables.filename) 
      });
      if (variables.subId) {
        queryClient.invalidateQueries({ 
          queryKey: imagenesKeys.latest(variables.type, variables.id, variables.subId) 
        });
      }
    },
  });
};

/**
 * Hook para eliminar una imagen
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteImageParams) => {
      const response = await imagenesService.deleteImage(params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar cachés relevantes
      queryClient.invalidateQueries({ 
        queryKey: imagenesKeys.list(variables.type) 
      });
    },
  });
};

/**
 * Hook para listar todas las imágenes de un tipo
 */
export const useListImagesByType = (type: ImageType) => {
  return useQuery({
    queryKey: imagenesKeys.list(type),
    queryFn: async () => {
      const response = await imagenesService.listImagesByType(type);
      return response.data;
    },
  });
};

/**
 * Hook para obtener metadata de una imagen
 */
export const useImageMetadata = ({ type, filename }: GetImageParams) => {
  return useQuery({
    queryKey: imagenesKeys.metadata(type, filename),
    queryFn: async () => {
      const response = await imagenesService.getImageMetadata({ type, filename });
      return response.data;
    },
    enabled: !!type && !!filename,
  });
};

/**
 * Hook para obtener todas las imágenes de una entidad
 */
export const useImagesByEntityId = ({ type, id }: GetImagesByEntityParams) => {
  return useQuery({
    queryKey: imagenesKeys.entity(type, id),
    queryFn: async () => {
      const response = await imagenesService.getImagesByEntityId({ type, id });
      return response.data;
    },
    enabled: !!type && !!id && id > 0,
  });
};

/**
 * Hook para obtener la imagen más reciente de una entidad
 */
export const useLatestImage = ({ type, id, subId }: GetLatestImageParams) => {
  return useQuery({
    queryKey: imagenesKeys.latest(type, id, subId),
    queryFn: async () => {
      const response = await imagenesService.getLatestImage({ type, id, subId });
      return response.data;
    },
    enabled: !!type && !!id && id > 0,
  });
};

/**
 * Hook helper para obtener URL de imagen
 * No hace llamada al servidor, solo genera la URL
 */
export const useImageUrl = ({ type, filename }: GetImageParams) => {
  if (!type || !filename) return null;
  return imagenesService.getImageUrl({ type, filename });
};

/**
 * Hook helper para validar archivo antes de subir
 */
export const useValidateImage = () => {
  return (file: File) => imagenesService.validateImageFile(file);
};

/**
 * Hook helper para formatear bytes
 */
export const useFormatBytes = () => {
  return (bytes: number) => imagenesService.formatBytes(bytes);
};
