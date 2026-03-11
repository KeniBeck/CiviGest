import { api } from './api';
import type {
  Infraccion,
  CreateInfraccionDto,
  UpdateInfraccionDto,
  FilterInfraccionesDto,
  InfraccionesResponseMeta,
  EstadisticasInfraccionesResponse,
} from '@/types/infraccion.type';
import type { PaginatedInfraccionesResponse } from '@/types/infraccion.type';

const BASE_URL = '/infracciones';

/**
 * Normaliza respuesta del backend (data + meta) a formato items + pagination para DataTable
 */
function normalizeListResponse(raw: InfraccionesResponseMeta): PaginatedInfraccionesResponse {
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

export const infraccionService = {
  /**
   * Listar infracciones con filtros y paginación.
   * Si el backend devuelve { data, meta }, se normaliza a { items, pagination }.
   */
  getAll: async (params?: FilterInfraccionesDto) => {
    const response = await api.get<InfraccionesResponseMeta | PaginatedInfraccionesResponse>(
      BASE_URL,
      { params }
    );
    const body = response.data;
    if (body && 'data' in body && 'meta' in body) {
      return { ...response, data: normalizeListResponse(body as InfraccionesResponseMeta) };
    }
    return response as { data: PaginatedInfraccionesResponse };
  },

  getById: async (id: number) => {
    const response = await api.get<Infraccion>(`${BASE_URL}/${id}`);
    return response;
  },

  getByFolio: async (folio: string) => {
    const response = await api.get<Infraccion>(`${BASE_URL}/folio/${encodeURIComponent(folio)}`);
    return response;
  },

  getByDocumento: async (documento: string) => {
    const response = await api.get<Infraccion[]>(
      `${BASE_URL}/documento/${encodeURIComponent(documento)}`
    );
    return response;
  },

  create: async (data: CreateInfraccionDto) => {
    const response = await api.post<Infraccion>(BASE_URL, data);
    return response;
  },

  update: async (id: number, data: UpdateInfraccionDto) => {
    const response = await api.patch<Infraccion>(`${BASE_URL}/${id}`, data);
    return response;
  },

  delete: async (id: number) => {
    const response = await api.delete<Infraccion>(`${BASE_URL}/${id}`);
    return response;
  },

  getEstadisticas: async (params?: { fechaInicio?: string; fechaFin?: string }) => {
    const response = await api.get<EstadisticasInfraccionesResponse>(
      `${BASE_URL}/estadisticas`,
      { params }
    );
    return response;
  },
};
