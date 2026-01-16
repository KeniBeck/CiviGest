import { api } from './api';
import type { PaginatedResponse } from '@/types/api.types';
import type { 
  Agente, 
  CreateAgente, 
  UpdateAgente, 
  GetAgentesParams 
} from '@/types/agente.type';

class AgenteService {
  private readonly baseUrl = '/agentes';

  /**
   * Obtener todos los agentes con paginación y filtros
   * ✅ IMPORTANTE: Usar /agentes/paginated para lista paginada
   */
  async getAll(params?: GetAgentesParams) {
    const response = await api.get<PaginatedResponse<Agente>>(
      `${this.baseUrl}/paginated`,
      { params }
    );
    return response;
  }

  /**
   * Obtener un agente por ID
   */
  async getById(id: number) {
    const response = await api.get<Agente>(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Crear un nuevo agente
   */
  async create(data: CreateAgente) {
    const response = await api.post<Agente>(this.baseUrl, data);
    return response;
  }

  /**
   * Actualizar un agente existente
   */
  async update(id: number, data: UpdateAgente) {
    const response = await api.patch<Agente>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  /**
   * Eliminar un agente (soft delete)
   */
  async delete(id: number) {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Restaurar un agente eliminado
   */
  async restore(id: number) {
    const response = await api.patch<Agente>(`${this.baseUrl}/${id}/restore`);
    return response;
  }

  /**
   * Cambiar el estado activo/inactivo de un agente
   */
  async toggleActive(id: number) {
    const response = await api.patch<Agente>(`${this.baseUrl}/${id}/toggle-active`);
    return response;
  }

  /**
   * Subir foto de agente
   */
  async uploadFoto(id: number, file: File) {
    const formData = new FormData();
    formData.append('foto', file);
    
    const response = await api.post<{ foto: string }>(
      `${this.baseUrl}/${id}/foto`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }
}

export const agenteService = new AgenteService();
