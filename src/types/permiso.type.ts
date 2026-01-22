
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
  estatus: 'SOLICITADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO' | 'CANCELADO';
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
  // ✅ Array de pagos asociados al permiso
  pagos?: Array<{
    id: number;
    metodoPago: string;
    total: string;
    fechaPago: string;
    estatus: 'PENDIENTE' | 'PAGADO' | 'CANCELADO' | 'REEMBOLSADO';
    referenciaPago: string | null;
    observaciones: string | null;
    costoBase: string;
    descuentoPct: string;
    descuentoMonto: string;
    qrComprobante: string;
    nombreCiudadano: string;
    documentoCiudadano: string;
    sede: {
      id: number;
      name: string;
    };
    subsede: {
      id: number;
      name: string;
    },
    usuarioCobro: {
      id: number;
      firstName: string;
      lastName: string;
      username: string;
    },
    usuarioAutorizo: [] | null

  }>;
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
  estatus?: 'SOLICITADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO' | 'CANCELADO';
  observaciones?: string;
  motivoRechazo?: string;
}

export interface GetPermisosParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  estatus?: 'SOLICITADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO' | 'CANCELADO';
  tipoPermisoId?: number;
}