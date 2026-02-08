/**
 * Tipos para el sistema de gestión de imágenes
 */

export type ImageType = 
  | 'configuraciones'  // Logos de sedes/subsedes
  | 'permisos'         // Imágenes de permisos ciudadanos
  | 'usuarios'         // Fotos de perfil de usuarios
  | 'comprobantes'     // Comprobantes de pago
  | 'documentos'      // Documentos adjuntos generales
  | 'agentes';         // Fotos de agentes

export interface ImageUploadResult {
  filename: string;
  url: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface ImageMetadata {
  filename: string;
  type: ImageType;
  path: string;
  size: number;
  mimetype: string;
  exists: boolean;
  createdAt: string;
  url: string;
}

export interface UploadImageParams {
  file: File;
  id: number;
  type: ImageType;
  subId?: number;
}

export interface ReplaceImageParams {
  file: File;
  id: number;
  type: ImageType;
  filename: string;
  subId?: number;
}

export interface GetImageParams {
  type: ImageType;
  filename: string;
}

export interface DeleteImageParams {
  type: ImageType;
  filename: string;
}

export interface GetImagesByEntityParams {
  type: ImageType;
  id: number;
}

export interface GetLatestImageParams {
  type: ImageType;
  id: number;
  subId?: number;
}

// Respuestas de la API
export interface ImageUploadResponse {
  statusCode: number;
  message: string;
  data: ImageUploadResult;
}

export interface ImageMetadataResponse {
  statusCode: number;
  message: string;
  data: ImageMetadata;
}

export interface ImageListResponse {
  statusCode: number;
  message: string;
  data: ImageMetadata[];
  total: number;
}

export interface ImageDeleteResponse {
  statusCode: number;
  message: string;
}
