import { api } from './api';
import type {
  TipoAgente,
  CreateTipoAgente,
  UpdateTipoAgente,
  GetTipoAgenteParams,
} from '@/types/tipo-agente.type';
import type { PaginatedResponse } from '@/types/api.types';

class TipoAgenteService {
  private baseUrl = '/tipos-agente';

  async getAll(params?: GetTipoAgenteParams) {
    const response = await api.get<PaginatedResponse<TipoAgente>>(
      `${this.baseUrl}/paginated`,
      { params }
    );
    return response;
  }

  async getById(id: number) {
    const response = await api.get<TipoAgente>(`${this.baseUrl}/${id}`);
    return response;
  }

  async create(data: CreateTipoAgente) {
    const response = await api.post<TipoAgente>(this.baseUrl, data);
    return response;
  }

  async update(id: number, data: UpdateTipoAgente) {
    const response = await api.patch<TipoAgente>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async delete(id: number) {
    const response = await api.delete<TipoAgente>(`${this.baseUrl}/${id}`);
    return response;
  }

  async restore(id: number) {
    const response = await api.patch<TipoAgente>(`${this.baseUrl}/${id}/restore`);
    return response;
  }

  async toggleActive(id: number) {
    const response = await api.patch<TipoAgente>(`${this.baseUrl}/${id}/toggle-active`);
    return response;
  }
}

export const tipoAgenteService = new TipoAgenteService();
