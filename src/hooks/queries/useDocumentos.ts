import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentosService } from '@/services/documento.service';
import type { 
  UploadDocumentoParams,
  UploadMultipleDocumentosParams,
  ReplaceDocumentoParams,
  DeleteDocumentoParams,
  GetDocumentoInfoParams,
} from '@/types/documentos.type';

// ✅ Query Keys para caché de React Query
export const documentosKeys = {
  all: ['documentos'] as const,
  info: (filename: string) => [...documentosKeys.all, 'info', filename] as const,
};

/**
 * Hook para subir un documento PDF
 */
export const useUploadDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadDocumentoParams) => {
      // Validar archivo antes de subir
      const validation = documentosService.validatePdfFile(params.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await documentosService.uploadDocumento(params);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las queries de documentos
      queryClient.invalidateQueries({ 
        queryKey: documentosKeys.all 
      });
    },
  });
};

/**
 * Hook para subir múltiples documentos PDF
 */
export const useUploadMultipleDocumentos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadMultipleDocumentosParams) => {
      // Validar archivos antes de subir
      const validation = documentosService.validateMultiplePdfFiles(params.files);
      if (!validation.valid) {
        throw new Error(validation.errors.join('\n'));
      }

      const response = await documentosService.uploadMultipleDocumentos(params);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las queries de documentos
      queryClient.invalidateQueries({ 
        queryKey: documentosKeys.all 
      });
    },
  });
};

/**
 * Hook para reemplazar un documento existente
 */
export const useReplaceDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReplaceDocumentoParams) => {
      // Validar archivo antes de subir
      const validation = documentosService.validatePdfFile(params.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await documentosService.replaceDocumento(params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: documentosKeys.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: documentosKeys.info(variables.filename) 
      });
    },
  });
};

/**
 * Hook para eliminar un documento
 */
export const useDeleteDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteDocumentoParams) => {
      const response = await documentosService.deleteDocumento(params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: documentosKeys.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: documentosKeys.info(variables.filename) 
      });
    },
  });
};

/**
 * Hook para obtener información de un documento
 */
export const useDocumentoInfo = (params: GetDocumentoInfoParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: documentosKeys.info(params.filename),
    queryFn: async () => {
      const response = await documentosService.getDocumentoInfo(params);
      return response.data;
    },
    enabled: enabled && !!params.filename,
  });
};

/**
 * Hook para descargar un documento
 * No usa React Query ya que es una acción directa
 */
export const useDownloadDocumento = () => {
  return {
    download: (filename: string) => {
      documentosService.downloadDocumento(filename);
    },
    getDownloadUrl: (filename: string) => {
      return documentosService.getDownloadUrl({ filename });
    },
  };
};

/**
 * Hook para visualizar un documento
 * No usa React Query ya que es una acción directa
 */
export const useViewDocumento = () => {
  return {
    view: (filename: string) => {
      documentosService.viewDocumento(filename);
    },
    getViewUrl: (filename: string) => {
      return documentosService.getViewUrl({ filename });
    },
  };
};
