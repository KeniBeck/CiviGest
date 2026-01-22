
import { api } from './api';
import type {
  PagoPermiso,
  CreatePagoPermisoDto,
  UpdatePagoPermisoDto,
  CreateReembolsoDto,
  FilterPagosPermisosDto,
  PaginatedPagosPermisosResponse,
  EnlacePublicoResponse,
} from '@/types/pago-permisos.type';

const BASE_URL = '/pagos-permisos';

export const pagoPermisoService = {
  /**
   * Crear un pago de permiso
   */
  create: async (data: CreatePagoPermisoDto) => {
    const response = await api.post<PagoPermiso>(BASE_URL, data);
    return response;
  },

  /**
   * Obtener todos los pagos (paginado)
   */
  getAll: async (params: FilterPagosPermisosDto = {}) => {
    const response = await api.get<PaginatedPagosPermisosResponse>(BASE_URL, { params });
    return response;
  },

  /**
   * Obtener un pago por ID
   */
  getById: async (id: number) => {
    const response = await api.get<PagoPermiso>(`${BASE_URL}/${id}`);
    return response;
  },

  /**
   * Obtener pagos de un permiso específico
   */
  getByPermisoId: async (permisoId: number) => {
    const response = await api.get<PaginatedPagosPermisosResponse>(BASE_URL, {
      params: { permisoId, activatePaginated: false },
    });
    return response;
  },

  /**
   * Actualizar un pago
   */
  update: async (id: number, data: UpdatePagoPermisoDto) => {
    const response = await api.patch<PagoPermiso>(`${BASE_URL}/${id}`, data);
    return response;
  },

  /**
   * Cancelar un pago (soft delete)
   */
  delete: async (id: number) => {
    const response = await api.delete<PagoPermiso>(`${BASE_URL}/${id}`);
    return response;
  },

  /**
   * Crear un reembolso
   */
  createReembolso: async (data: CreateReembolsoDto) => {
    const response = await api.post<PagoPermiso>(`${BASE_URL}/reembolso`, data);
    return response;
  },

  /**
   * Generar enlace público temporal
   */
  generarEnlacePublico: async (id: number) => {
    const response = await api.post<EnlacePublicoResponse>(
      `${BASE_URL}/${id}/generar-enlace-publico`
    );
    return response;
  },

  /**
   * Ver comprobante público (sin autenticación)
   */
  getComprobantePublico: async (token: string) => {
    const response = await api.get<PagoPermiso>(`${BASE_URL}/publico/${token}`);
    return response;
  },
};
