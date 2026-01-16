import { api } from './api';
import type { PaginatedResponse } from '@/types/api.types';
import type { 
  Permiso, 
  CreatePermiso, 
  UpdatePermiso, 
  GetPermisosParams 
} from '@/types/permiso.type';

class PermisoService {
  private readonly baseUrl = '/permiso';

  /**
   * Obtener todos los permisos con paginación y filtros
   * ✅ IMPORTANTE: Usar /permisos/paginated para lista paginada
   */
  async getAll(params?: GetPermisosParams) {
    const response = await api.get<PaginatedResponse<Permiso>>(
      `${this.baseUrl}`,
      { params }
    );
    return response;
  }

  /**
   * Obtener un permiso por ID
   */
  async getById(id: number) {
    const response = await api.get<Permiso>(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Crear un nuevo permiso
   */
  async create(data: CreatePermiso) {
    const response = await api.post<Permiso>(this.baseUrl, data);
    return response;
  }

  /**
   * Actualizar un permiso existente
   */
  async update(id: number, data: UpdatePermiso) {
    const response = await api.patch<Permiso>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  /**
   * Eliminar un permiso (soft delete)
   */
  async delete(id: number) {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  /**
   * Restaurar un permiso eliminado
   */
  async restore(id: number) {
    const response = await api.patch<Permiso>(`${this.baseUrl}/${id}/restore`);
    return response;
  }

  /**
   * Cambiar el estado activo/inactivo de un permiso
   */
  async toggleActive(id: number) {
    const response = await api.patch<Permiso>(`${this.baseUrl}/${id}/toggle-active`);
    return response;
  }

  /**
   * Aprobar un permiso
   */
  async aprobar(id: number, observaciones?: string) {
    const response = await api.patch<Permiso>(`${this.baseUrl}/${id}/aprobar`, {
      observaciones,
    });
    return response;
  }

  /**
   * Rechazar un permiso
   */
  async rechazar(id: number, motivoRechazo: string) {
    const response = await api.patch<Permiso>(`${this.baseUrl}/${id}/rechazar`, {
      motivoRechazo,
    });
    return response;
  }

  /**
   * Generar QR del permiso
   */
  async generarQR(id: number) {
    const response = await api.post<{ qr: string }>(`${this.baseUrl}/${id}/generar-qr`);
    return response;
  }
}

export const permisoService = new PermisoService();
