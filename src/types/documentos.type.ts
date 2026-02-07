/**
 * Tipos para el servicio de Documentos PDF
 */

/**
 * Respuesta al subir un documento
 */
export interface DocumentoUploadResponse {
  nombreArchivo: string;
  rutaArchivo: string;
  tamanoBytes: number;
  mimeType: string;
}

/**
 * Información de un documento
 */
export interface DocumentoInfoResponse {
  exists: boolean;
  size: number;
  path: string;
}

/**
 * Respuesta al eliminar un documento
 */
export interface DocumentoDeleteResponse {
  message: string;
}

/**
 * Parámetros para subir un documento
 */
export interface UploadDocumentoParams {
  file: File;
}

/**
 * Parámetros para subir múltiples documentos
 */
export interface UploadMultipleDocumentosParams {
  files: File[];
}

/**
 * Parámetros para reemplazar un documento
 */
export interface ReplaceDocumentoParams {
  file: File;
  filename: string;
}

/**
 * Parámetros para eliminar un documento
 */
export interface DeleteDocumentoParams {
  filename: string;
}

/**
 * Parámetros para obtener información de un documento
 */
export interface GetDocumentoInfoParams {
  filename: string;
}

/**
 * Parámetros para obtener URL de descarga
 */
export interface GetDocumentoDownloadUrlParams {
  filename: string;
}

/**
 * Parámetros para obtener URL de visualización
 */
export interface GetDocumentoViewUrlParams {
  filename: string;
}

/**
 * Validación de archivo PDF
 */
export interface DocumentoValidation {
  valid: boolean;
  error?: string;
}
