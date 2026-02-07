import { api } from './api';
import { ENV } from '@/config/env';
import type { 
  DocumentoUploadResponse,
  DocumentoInfoResponse,
  DocumentoDeleteResponse,
  UploadDocumentoParams,
  UploadMultipleDocumentosParams,
  ReplaceDocumentoParams,
  DeleteDocumentoParams,
  GetDocumentoInfoParams,
  GetDocumentoDownloadUrlParams,
  GetDocumentoViewUrlParams,
  DocumentoValidation,
} from '@/types/documentos.type';

class DocumentosService {
  private readonly baseUrl = '/documentos';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10 MB en bytes
  private readonly allowedMimeTypes = ['application/pdf'];

  /**
   * Validar que el archivo sea un PDF válido
   */
  validatePdfFile(file: File): DocumentoValidation {
    // Verificar tipo MIME
    if (!this.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Solo se permiten archivos PDF',
      };
    }

    // Verificar tamaño
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `El archivo no debe exceder ${this.maxFileSize / (1024 * 1024)} MB`,
      };
    }

    // Verificar extensión
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return {
        valid: false,
        error: 'El archivo debe tener extensión .pdf',
      };
    }

    return { valid: true };
  }

  /**
   * Subir un documento PDF
   * POST /documentos/upload
   */
  async uploadDocumento({ file }: UploadDocumentoParams) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<DocumentoUploadResponse>(
      `${this.baseUrl}/upload`,
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
   * Subir múltiples documentos PDF
   * POST /documentos/upload-multiple
   */
  async uploadMultipleDocumentos({ files }: UploadMultipleDocumentosParams) {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<DocumentoUploadResponse[]>(
      `${this.baseUrl}/upload-multiple`,
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
   * Reemplazar un documento existente
   * POST /documentos/replace/:filename
   */
  async replaceDocumento({ file, filename }: ReplaceDocumentoParams) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<DocumentoUploadResponse>(
      `${this.baseUrl}/replace/${filename}`,
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
   * Eliminar un documento
   * DELETE /documentos/:filename
   */
  async deleteDocumento({ filename }: DeleteDocumentoParams) {
    const response = await api.delete<DocumentoDeleteResponse>(
      `${this.baseUrl}/${filename}`
    );

    return response;
  }

  /**
   * Obtener información de un documento
   * GET /documentos/info/:filename
   */
  async getDocumentoInfo({ filename }: GetDocumentoInfoParams) {
    const response = await api.get<DocumentoInfoResponse>(
      `${this.baseUrl}/info/${filename}`
    );

    return response;
  }

  /**
   * Obtener URL de descarga de un documento
   * GET /documentos/download/:filename
   */
  getDownloadUrl({ filename }: GetDocumentoDownloadUrlParams): string {
    return `${ENV.API_URL}${this.baseUrl}/download/${filename}`;
  }

  /**
   * Obtener URL de visualización de un documento
   * GET /documentos/view/:filename
   */
  getViewUrl({ filename }: GetDocumentoViewUrlParams): string {
    return `${ENV.API_URL}${this.baseUrl}/view/${filename}`;
  }

  /**
   * Descargar un documento (fuerza descarga)
   * @param filename - Nombre del archivo a descargar
   */
  downloadDocumento(filename: string): void {
    const url = this.getDownloadUrl({ filename });
    window.location.href = url;
  }

  /**
   * Ver un documento en nueva ventana
   * @param filename - Nombre del archivo a visualizar
   */
  viewDocumento(filename: string): void {
    const url = this.getViewUrl({ filename });
    window.open(url, '_blank');
  }

  /**
   * Extraer el nombre del archivo desde una ruta completa
   * Ejemplo: "images/documentos/file-123.pdf" -> "file-123.pdf"
   */
  extractFilename(rutaArchivo: string): string {
    return rutaArchivo.split('/').pop() || rutaArchivo;
  }

  /**
   * Validar múltiples archivos PDF
   */
  validateMultiplePdfFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (files.length === 0) {
      return { valid: false, errors: ['Debe seleccionar al menos un archivo'] };
    }

    if (files.length > 10) {
      return { valid: false, errors: ['No se pueden subir más de 10 archivos a la vez'] };
    }

    files.forEach((file, index) => {
      const validation = this.validatePdfFile(file);
      if (!validation.valid) {
        errors.push(`Archivo ${index + 1} (${file.name}): ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const documentosService = new DocumentosService();
