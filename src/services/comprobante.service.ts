import axios from 'axios';
import { ENV } from '@/config/env';
import type { PaginatedResponse } from '@/types/api.types';
import type { Permiso, GetPermisosComprobantesParams } from '@/types/permiso.type';

/**
 * Servicio para comprobantes públicos (sin autenticación)
 * Este servicio NO usa el api client porque es público
 */
class ComprobanteService {
  private readonly baseUrl = `${ENV.API_URL}/permiso`;

  /**
   * Obtener comprobantes de permisos por documento de ciudadano
   * ✅ Endpoint público - NO requiere autenticación
   */
  async getComprobantesByDocumento(params?: GetPermisosComprobantesParams) {
    const response = await axios.get<PaginatedResponse<Permiso>>(
      `${this.baseUrl}/dni`,
      { params }
    );
    return response;
  }
}

export const comprobanteService = new ComprobanteService();
