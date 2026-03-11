export type InfraccionEstatus =
  | 'LEVANTADA'
  | 'PAGADA'
  | 'CANCELADA'
  | 'PRESCRITA'
  | 'EN_PROCESO';

export interface Infraccion {
  id: number;
  sedeId: number;
  subsedeId: number;
  multaId: number;
  folio: string;
  nombreCiudadano: string;
  documentoCiudadano: string;
  domicilioCiudadano: string | null;
  telefonoCiudadano: string | null;
  emailCiudadano: string | null;
  descripcion: string | null;
  ubicacion: string | null;
  latitud: number | string | null;
  longitud: number | string | null;
  fechaInfraccion: string;
  fechaLevantamiento: string;
  agenteId: number | null;
  costoBase: number | string | null;
  numUMAs: number | string | null;
  numSalarios: number | string | null;
  estatus: InfraccionEstatus;
  evidencias: unknown;
  observaciones: string | null;
  fechaLimitePago: string | null;
  qr?: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
  deletedBy: number | null;
  multa?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  agente?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    numPlaca?: string;
  };
  sede?: {
    id: number;
    name: string;
    code: string;
  };
  subsede?: {
    id: number;
    name: string;
    code: string;
  };
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
    qrComprobante: string | null;
    nombreCiudadano: string;
    documentoCiudadano: string;
    usuarioCobro?: {
      id: number;
      firstName: string;
      lastName: string;
      username: string;
    };
  }>;
}

export interface CreateInfraccionDto {
  multaId: number;
  folio?: string;
  nombreCiudadano: string;
  documentoCiudadano: string;
  domicilioCiudadano?: string;
  telefonoCiudadano?: string;
  emailCiudadano?: string;
  descripcion?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  fechaInfraccion: string;
  agenteId?: number;
  evidencias?: unknown;
  observaciones?: string;
}

export interface UpdateInfraccionDto {
  estatus?: InfraccionEstatus;
  observaciones?: string;
  descripcion?: string;
}

export interface FilterInfraccionesDto {
  page?: number;
  limit?: number;
  search?: string;
  estatus?: InfraccionEstatus;
  vencidas?: boolean;
  multaId?: number;
  agenteId?: number;
  sedeId?: number;
  subsedeId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  isActive?: boolean;
  folio?: string;
}

/** Respuesta del backend con data + meta (README infracciones) */
export interface InfraccionesResponseMeta {
  data: Infraccion[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Normalizado para DataTable (items + pagination) */
export interface PaginatedInfraccionesResponse {
  items: Infraccion[];
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EstadisticasInfraccionesResponse {
  totalInfracciones: number;
  levantadas: number;
  pagadas: number;
  canceladas: number;
  vencidas: number;
}
