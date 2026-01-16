import { api } from './api';
import type { PaginatedResponse } from '@/types/api.types';
import type { 
  Patrulla, 
  CreatePatrulla, 
  UpdatePatrulla, 
  GetPatrullaParams 
} from '@/types/patrulla.type';

class PatrullaService {
  private readonly baseUrl = '/patrullas';

  /**
   * Obtener todas las patrullas con paginación y filtros
   * ✅ IMPORTANTE: Usar /patrullas/paginated para lista paginada
   */
  async getAll(params?: GetPatrullaParams) {
    const response = await api.get<PaginatedResponse<Patrulla>>(
      `${this.baseUrl}/paginated`,
      { params }
    );
    return response;
  }

  /**
   * Obtener una patrulla por ID
   */
  async getById(id: number) {
    const response = await api.get<Patrulla>(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Crear una nueva patrulla
   */
  async create(data: CreatePatrulla) {
    const response = await api.post<Patrulla>(this.baseUrl, data);
    return response;
  }

  /**
   * Actualizar una patrulla existente
   */
  async update(id: number, data: UpdatePatrulla) {
    const response = await api.patch<Patrulla>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  /**
   * Eliminar una patrulla (soft delete)
   */
  async delete(id: number) {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Restaurar una patrulla eliminada
   */
  async restore(id: number) {
    const response = await api.patch<Patrulla>(`${this.baseUrl}/${id}/restore`);
    return response;
  }

  /**
   * Cambiar el estado activo/inactivo de una patrulla
   */
  async toggleActive(id: number) {
    const response = await api.patch<Patrulla>(`${this.baseUrl}/${id}/toggle-active`);
    return response;
  }
}

export const patrullaService = new PatrullaService();
