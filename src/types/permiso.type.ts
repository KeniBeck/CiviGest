
export interface Permiso {
  id: number;
  sedeId: number;
  subsedeId: number;
  tipoPermisoId: number;
  folio: string;
  descripcion: string;
  nombreCiudadano: string;
  documentoCiudadano: string;
  domicilioCiudadano: string;
  telefonoCiudadano: string;
  emailCiudadano: string;
  costo: string;
  numSalarios: string;
  numUMAs: string;
  fechaEmision: string;
  fechaVencimiento: string;
  vigenciaDias: number;
  qr: string;
  estatus: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO';
  documentosAdjuntos: Record<string, any>;
  camposAdicionales: Record<string, any>;
  fechaSolicitud: string;
  fechaAprobacion: string | null;
  fechaRechazo: string | null;
  observaciones: string | null;
  motivoRechazo: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  sede: {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
  };
  subsede: {
    id: number;
    sedeId: number;
    name: string;
    code: string;
    isActive: boolean;
  };
  tipoPermiso: {
    id: number;
    sedeId: number;
    subsedeId: number;
    nombre: string;
    descripcion: string;
    camposPersonalizados: {
      fields: Array<{
        name: string;
        type: string;
        required: boolean;
      }>;
    };
    costoBase: string;
    numUMAsBase: string;
    numSalariosBase: string;
    vigenciaDefecto: number;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
  };
}

export interface CreatePermiso {
  tipoPermisoId: number;
  nombreCiudadano: string;
  documentoCiudadano: string;
  domicilioCiudadano: string;
  telefonoCiudadano: string;
  emailCiudadano: string;
  fechaEmision: string;
  vigenciaDias: number;
  camposAdicionales?: Record<string, any>;
  documentosAdjuntos?: Record<string, any>;
  descripcion: string;
}

export interface UpdatePermiso {
  tipoPermisoId?: number;
  nombreCiudadano?: string;
  documentoCiudadano?: string;
  domicilioCiudadano?: string;
  telefonoCiudadano?: string;
  emailCiudadano?: string;
  fechaEmision?: string;
  vigenciaDias?: number;
  camposAdicionales?: Record<string, any>;
  documentosAdjuntos?: Record<string, any>;
  descripcion?: string;
  estatus?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO';
  observaciones?: string;
  motivoRechazo?: string;
}

export interface GetPermisosParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  estatus?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO';
  tipoPermisoId?: number;
}