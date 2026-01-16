import { api } from './api';
import type { PaginatedResponse } from '@/types/api.types';
import type { 
  TipoPermiso, 
  CreateTipoPermiso, 
  UpdateTipoPermiso, 
  GetTipoPermisoParams 
} from '@/types/tipo-permiso.type';

class TipoPermisoService {
  private readonly baseUrl = '/tipos-permiso';

  /**
   * Obtener todos los tipos de permiso con paginación y filtros
   * ✅ IMPORTANTE: Usar /tipo-permisos/paginated para lista paginada
   */
  async getAll(params?: GetTipoPermisoParams) {
    const response = await api.get<PaginatedResponse<TipoPermiso>>(
      `${this.baseUrl}`,
      { params }
    );
    return response;
  }

  /**
   * Obtener un tipo de permiso por ID
   */
  async getById(id: number) {
    const response = await api.get<TipoPermiso>(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Crear un nuevo tipo de permiso
   */
  async create(data: CreateTipoPermiso) {
    const response = await api.post<TipoPermiso>(this.baseUrl, data);
    return response;
  }

  /**
   * Actualizar un tipo de permiso existente
   */
  async update(id: number, data: UpdateTipoPermiso) {
    const response = await api.patch<TipoPermiso>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  /**
   * Eliminar un tipo de permiso (soft delete)
   */
  async delete(id: number) {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Restaurar un tipo de permiso eliminado
   */
  async restore(id: number) {
    const response = await api.patch<TipoPermiso>(`${this.baseUrl}/${id}/restore`);
    return response;
  }

  /**
   * Cambiar el estado activo/inactivo de un tipo de permiso
   */
  async toggleActive(id: number) {
    const response = await api.patch<TipoPermiso>(`${this.baseUrl}/${id}/toggle-active`);
    return response;
  }
}

export const tipoPermisoService = new TipoPermisoService();
