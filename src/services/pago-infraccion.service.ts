import { api } from './api';
import type {
  PagoInfraccion,
  CreatePagoInfraccionDto,
  UpdatePagoInfraccionDto,
  CreateReembolsoInfraccionDto,
  FilterPagosInfraccionesDto,
  PaginatedPagosInfraccionesResponse,
  PaginatedPagosInfraccionesNormalized,
} from '@/types/pago-infraccion.type';

const BASE_URL = '/pagos-infracciones';

/**
 * Normaliza respuesta del backend (data + meta) a formato items + pagination
 */
function normalizeListResponse(
  raw: PaginatedPagosInfraccionesResponse
): PaginatedPagosInfraccionesNormalized {
  const { data, meta } = raw;
  return {
    items: data,
    pagination: {
      totalItems: meta.total,
      itemsPerPage: meta.limit,
      currentPage: meta.page,
      totalPages: meta.totalPages,
      hasNextPage: meta.page < meta.totalPages,
      hasPreviousPage: meta.page > 1,
    },
  };
}

export const pagoInfraccionService = {
  create: async (data: CreatePagoInfraccionDto) => {
    const response = await api.post<PagoInfraccion>(BASE_URL, data);
    return response;
  },

  getAll: async (params?: FilterPagosInfraccionesDto) => {
    const response = await api.get<
      PaginatedPagosInfraccionesResponse | PaginatedPagosInfraccionesNormalized
    >(BASE_URL, { params });
    const body = response.data;
    if (body && 'data' in body && 'meta' in body) {
      return {
        ...response,
        data: normalizeListResponse(body as PaginatedPagosInfraccionesResponse),
      };
    }
    return response as { data: PaginatedPagosInfraccionesNormalized };
  },

  getById: async (id: number) => {
    const response = await api.get<PagoInfraccion>(`${BASE_URL}/${id}`);
    return response;
  },

  getByFolioInfraccion: async (folioInfraccion: string) => {
    const response = await api.get<PagoInfraccion[]>(
      `${BASE_URL}/folio/${encodeURIComponent(folioInfraccion)}`
    );
    return response;
  },

  update: async (id: number, data: UpdatePagoInfraccionDto) => {
    const response = await api.patch<PagoInfraccion>(`${BASE_URL}/${id}`, data);
    return response;
  },

  delete: async (id: number) => {
    const response = await api.delete<PagoInfraccion>(`${BASE_URL}/${id}`);
    return response;
  },

  createReembolso: async (data: CreateReembolsoInfraccionDto) => {
    const response = await api.post<PagoInfraccion>(`${BASE_URL}/reembolso`, data);
    return response;
  },

  getEstadisticas: async (params?: { fechaInicio?: string; fechaFin?: string }) => {
    const response = await api.get(`${BASE_URL}/estadisticas`, { params });
    return response;
  },
};
