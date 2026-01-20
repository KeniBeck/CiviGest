import { api } from './api';
import type {
  Multas,
  CreateMultas,
  UpdateMultas,
  GetMultasParams,
} from '@/types/multas.type';
import type { PaginatedResponse } from '@/types/api.types';

class MultasService {
  private baseUrl = '/multas';

  async getAll(params?: GetMultasParams) {
    const response = await api.get<PaginatedResponse<Multas>>(
      `${this.baseUrl}/paginated`,
      { params }
    );
    return response;
  }

  async getById(id: number) {
    const response = await api.get<Multas>(`${this.baseUrl}/${id}`);
    return response;
  }

  async create(data: CreateMultas) {
    const response = await api.post<Multas>(this.baseUrl, data);
    return response;
  }

  async update(id: number, data: UpdateMultas) {
    const response = await api.patch<Multas>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async delete(id: number) {
    const response = await api.delete<Multas>(`${this.baseUrl}/${id}`);
    return response;
  }

  async restore(id: number) {
    const response = await api.patch<Multas>(`${this.baseUrl}/${id}/restore`);
    return response;
  }

  async toggleActive(id: number) {
    const response = await api.patch<Multas>(`${this.baseUrl}/${id}/toggle-active`);
    return response;
  }
}

export const multasService = new MultasService();
