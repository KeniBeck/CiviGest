import { useQuery } from '@tanstack/react-query';
import { comprobanteService } from '@/services/comprobante.service';
import type { GetPermisosComprobantesParams } from '@/types/permiso.type';

// ✅ Query Keys para caché de React Query
export const comprobanteKeys = {
  all: ['comprobantes'] as const,
  lists: () => [...comprobanteKeys.all, 'list'] as const,
  list: (filters: GetPermisosComprobantesParams) => [...comprobanteKeys.lists(), filters] as const,
  byDocumento: (documento: string) => [...comprobanteKeys.all, 'documento', documento] as const,
};

/**
 * Hook para obtener comprobantes por documento de ciudadano
 * ✅ Endpoint público - NO requiere autenticación
 */
export const useComprobantesByDocumento = (documento: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: comprobanteKeys.byDocumento(documento),
    queryFn: async () => {
      const response = await comprobanteService.getComprobantesByDocumento({
        documentoCiudadano: documento,
      });
      return response.data;
    },
    enabled: enabled && !!documento && documento.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para obtener comprobantes con filtros personalizados
 */
export const useComprobantes = (params: GetPermisosComprobantesParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: comprobanteKeys.list(params),
    queryFn: async () => {
      const response = await comprobanteService.getComprobantesByDocumento(params);
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
