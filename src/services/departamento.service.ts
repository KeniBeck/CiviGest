// filepath: /home/andresdev/utils/repos/CiviGest/CiviGest/src/services/departamento.service.ts
import { api } from './api';
import type {
  Departamento,
  CreateDepartamento,
  UpdateDepartamento,
  GetDepartamentoParams,
} from '@/types/departamento.type';
import type { PaginatedResponse } from '@/types/api.types';

class DepartamentoService {
  private baseUrl = '/departamentos';

  async getAll(params?: GetDepartamentoParams) {
    const response = await api.get<PaginatedResponse<Departamento>>(
      `${this.baseUrl}/paginated`,
      { params }
    );
    return response;
  }

  async getById(id: number) {
    const response = await api.get<Departamento>(`${this.baseUrl}/${id}`);
    return response;
  }

  async create(data: CreateDepartamento) {
    const response = await api.post<Departamento>(this.baseUrl, data);
    return response;
  }

  async update(id: number, data: UpdateDepartamento) {
    const response = await api.patch<Departamento>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async delete(id: number) {
    const response = await api.delete<Departamento>(`${this.baseUrl}/${id}`);
    return response;
  }

  async restore(id: number) {
    const response = await api.patch<Departamento>(`${this.baseUrl}/${id}/restore`);
    return response;
  }

  async toggleActive(id: number) {
    const response = await api.patch<Departamento>(`${this.baseUrl}/${id}/toggle-active`);
    return response;
  }
}

export const departamentoService = new DepartamentoService();
