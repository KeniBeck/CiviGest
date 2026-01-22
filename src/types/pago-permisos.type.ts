
export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA';
export type EstatusPago = 'PENDIENTE' | 'PAGADO' | 'CANCELADO' | 'REEMBOLSADO';

export interface PagoPermiso {
  id: number;
  sedeId: number;
  subsedeId: number;
  permisoId: number;
  nombreCiudadano: string;
  documentoCiudadano: string;
  costoBase: number;
  descuentoPct: number;
  descuentoMonto: number;
  total: number;
  metodoPago: MetodoPago;
  referenciaPago: string | null;
  autorizaDescuento: boolean;
  autorizadoPor: number | null;
  firmaAutorizacion: string | null;
  usuarioCobroId: number;
  fechaPago: string;
  estatus: EstatusPago;
  observaciones: string | null;
  qrComprobante: string | null;
  tokenPublico: string | null;
  tokenExpiraEn: string | null;
  pagoOriginalId: number | null;
  esReembolso: boolean;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;
  permiso?: {
    id: number;
    folio: string;
    tipoPermiso: {
      id: number;
      nombre: string;
    };
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
  usuarioCobro?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  usuarioAutorizo?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
}

export interface CreatePagoPermisoDto {
  permisoId: number;
  costoBase: number;
  descuentoPct?: number;
  metodoPago: MetodoPago;
  observaciones?: string;
  autorizaDescuento?: boolean;
  autorizadoPor?: number;
  firmaAutorizacion?: string;
  enviarWhatsApp?: boolean;
  enviarEmail?: boolean;
}

export interface UpdatePagoPermisoDto {
  observaciones?: string;
  referenciaPago?: string;
  estatus?: EstatusPago;
}

export interface CreateReembolsoDto {
  pagoOriginalId: number;
  motivoReembolso?: string;
  autorizadoPor?: number;
}

export interface FilterPagosPermisosDto {
  page?: number;
  limit?: number;
  sedeId?: number;
  subsedeId?: number;
  permisoId?: number;
  search?: string;
  metodoPago?: MetodoPago;
  estatus?: EstatusPago;
  fechaInicio?: string;
  fechaFin?: string;
  usuarioCobroId?: number;
  isActive?: boolean;
  esReembolso?: boolean;
  activatePaginated?: boolean;
}

export interface PaginatedPagosPermisosResponse {
  data: PagoPermiso[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EnlacePublicoResponse {
  success: boolean;
  enlacePublico: string;
  expiraEn: string;
}

export interface EstadisticasPagosResponse {
  totalPagos: number;
  pagosPendientes: number;
  pagosReembolsados: number;
  montoTotal: number;
}
