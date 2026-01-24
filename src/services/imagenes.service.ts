import { api } from './api';
import { ENV } from '@/config/env';
import type { 
  ImageType,
  ImageUploadResponse,
  ImageMetadataResponse,
  ImageListResponse,
  ImageDeleteResponse,
  UploadImageParams,
  ReplaceImageParams,
  GetImageParams,
  DeleteImageParams,
  GetImagesByEntityParams,
  GetLatestImageParams,
} from '@/types/imagenes.type';

class ImagenesService {
  private readonly baseUrl = '/imagenes';

  /**
   * Subir una nueva imagen
   * POST /imagenes/upload/:type?id=1&subId=2
   */
  async uploadImage({ file, id, type, subId }: UploadImageParams) {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams({ id: id.toString() });
    if (subId) {
      params.append('subId', subId.toString());
    }

    const response = await api.post<ImageUploadResponse>(
      `${this.baseUrl}/upload/${type}?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  }

  /**
   * Reemplazar una imagen existente
   * POST /imagenes/replace/:type/:filename?id=1&subId=2
   */
  async replaceImage({ file, id, type, filename, subId }: ReplaceImageParams) {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams({ id: id.toString() });
    if (subId) {
      params.append('subId', subId.toString());
    }

    const response = await api.post<ImageUploadResponse>(
      `${this.baseUrl}/replace/${type}/${filename}?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  }

  /**
   * Obtener URL completa de una imagen
   * GET /imagenes/:type/:filename
   */
  getImageUrl({ type, filename }: GetImageParams): string {
    return `${ENV.API_URL}${this.baseUrl}/${type}/${filename}`;
  }

  /**
   * Eliminar una imagen
   * DELETE /imagenes/:type/:filename
   */
  async deleteImage({ type, filename }: DeleteImageParams) {
    const response = await api.delete<ImageDeleteResponse>(
      `${this.baseUrl}/${type}/${filename}`
    );

    return response;
  }

  /**
   * Listar todas las imágenes de un tipo
   * GET /imagenes/list/:type
   */
  async listImagesByType(type: ImageType) {
    const response = await api.get<ImageListResponse>(
      `${this.baseUrl}/list/${type}`
    );

    return response;
  }

  /**
   * Obtener metadata de una imagen
   * GET /imagenes/metadata/:type/:filename
   */
  async getImageMetadata({ type, filename }: GetImageParams) {
    const response = await api.get<ImageMetadataResponse>(
      `${this.baseUrl}/metadata/${type}/${filename}`
    );

    return response;
  }

  /**
   * Obtener todas las imágenes de una entidad
   * GET /imagenes/entity/:type/:id
   */
  async getImagesByEntityId({ type, id }: GetImagesByEntityParams) {
    const response = await api.get<ImageListResponse>(
      `${this.baseUrl}/entity/${type}/${id}`
    );

    return response;
  }

  /**
   * Obtener la imagen más reciente de una entidad
   * GET /imagenes/latest/:type/:id?subId=2
   */
  async getLatestImage({ type, id, subId }: GetLatestImageParams) {
    const params = subId ? `?subId=${subId}` : '';
    const response = await api.get<ImageMetadataResponse>(
      `${this.baseUrl}/latest/${type}/${id}${params}`
    );

    return response;
  }

  /**
   * Validar archivo antes de subir
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      return { valid: false, error: 'No se proporcionó ningún archivo' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Tipo de archivo no permitido. Permitidos: jpg, jpeg, png, webp' 
      };
    }

    if (file.size > maxFileSize) {
      return { 
        valid: false, 
        error: `Archivo muy grande. Máximo ${maxFileSize / (1024 * 1024)}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Formatear bytes a formato legible
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const imagenesService = new ImagenesService();
