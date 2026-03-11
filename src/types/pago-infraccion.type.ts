export type MetodoPago =
  | 'EFECTIVO'
  | 'TARJETA_DEBITO'
  | 'TARJETA_CREDITO'
  | 'TRANSFERENCIA'
  | 'CHEQUE'
  | 'SPEI';

export type EstatusPago = 'PENDIENTE' | 'PAGADO' | 'CANCELADO' | 'REEMBOLSADO';

export interface PagoInfraccion {
  id: number;
  sedeId: number;
  subsedeId: number;
  multaId: number;
  folioInfraccion: string;
  nombreCiudadano: string;
  documentoCiudadano: string;
  costoBase: number | string;
  descuentoPct: number | string;
  descuentoMonto: number | string;
  total: number | string;
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
  createdBy: number | null;
  updatedBy: number | null;
  deletedBy: number | null;
  multa?: {
    id: number;
    nombre: string;
    codigo: string;
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

export interface CreatePagoInfraccionDto {
  multaId: number;
  folioInfraccion: string;
  nombreCiudadano: string;
  documentoCiudadano: string;
  costoBase: number;
  descuentoPct?: number;
  descuentoMonto?: number;
  metodoPago?: MetodoPago;
  referenciaPago?: string;
  autorizaDescuento?: boolean;
  autorizadoPor?: number;
  firmaAutorizacion?: string;
  observaciones?: string;
}

export interface UpdatePagoInfraccionDto {
  observaciones?: string;
  referenciaPago?: string;
  estatus?: EstatusPago;
}

export interface CreateReembolsoInfraccionDto {
  pagoOriginalId: number;
  motivoReembolso?: string;
}

export interface FilterPagosInfraccionesDto {
  page?: number;
  limit?: number;
  sedeId?: number;
  subsedeId?: number;
  multaId?: number;
  folioInfraccion?: string;
  search?: string;
  metodoPago?: MetodoPago;
  estatus?: EstatusPago;
  fechaInicio?: string;
  fechaFin?: string;
  usuarioCobroId?: number;
  isActive?: boolean;
  esReembolso?: boolean;
}

/** Respuesta del backend con data + meta (README pagos infracciones) */
export interface PaginatedPagosInfraccionesResponse {
  data: PagoInfraccion[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Normalizado para listas (items + pagination) */
export interface PaginatedPagosInfraccionesNormalized {
  items: PagoInfraccion[];
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EstadisticasPagosInfraccionesResponse {
  totalPagos: number;
  pagosPendientes: number;
  pagosReembolsados: number;
  montoTotal: number | string;
}
