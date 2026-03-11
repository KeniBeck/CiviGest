// ==========================================
// DASHBOARD - FILTROS COMUNES
// ==========================================
export interface DashboardFiltersDto {
  fechaInicio?: string;
  fechaFin?: string;
  sedeId?: number;
  subsedeId?: number;
}

// ==========================================
// MÉTRICAS PRINCIPALES (/dashboard/metrics)
// ==========================================

export interface MetricasOrganizacionSuperAdmin {
  totalSedes: number;
  totalSubsedes: number;
  totalUsuarios: number;
}

export interface MetricasOrganizacionEstatal {
  totalMunicipios: number;
  totalUsuarios: number;
}

export interface MetricasOrganizacionMunicipal {
  totalUsuarios: number;
}

export type MetricasOrganizacion =
  | MetricasOrganizacionSuperAdmin
  | MetricasOrganizacionEstatal
  | MetricasOrganizacionMunicipal;

export interface MetricasInfraccionesSuperAdmin {
  total: number;
  pagadas: number;
  pendientes: number;
}

export interface MetricasInfraccionesMunicipal extends MetricasInfraccionesSuperAdmin {
  vencidas: number;
}

export type MetricasInfracciones = MetricasInfraccionesSuperAdmin | MetricasInfraccionesMunicipal;

export interface MetricasPermisosSuperAdmin {
  total: number;
  aprobados: number;
  pendientes: number;
}

export interface MetricasPermisosMunicipal extends MetricasPermisosSuperAdmin {
  enRevision: number;
}

export type MetricasPermisos = MetricasPermisosSuperAdmin | MetricasPermisosMunicipal;

export interface MetricasFinanzasSuperAdmin {
  totalPagosInfracciones: number;
  totalPagosPermisos: number;
  montoInfracciones: number;
  montoPermisos: number;
  montoTotal: number;
}

export interface MetricasFinanzasOtros {
  montoInfracciones: number;
  montoPermisos: number;
  montoTotal: number;
}

export type MetricasFinanzas = MetricasFinanzasSuperAdmin | MetricasFinanzasOtros;

export interface DashboardMetrics {
  organizacion: MetricasOrganizacion;
  infracciones: MetricasInfracciones;
  permisos: MetricasPermisos;
  finanzas: MetricasFinanzas;
}

// ==========================================
// TENDENCIAS (/dashboard/trends)
// ==========================================

export interface TrendItem {
  mes: string;
  cantidad: number;
}

export interface TrendPagoItem {
  mes: string;
  cantidad: number;
  monto: number;
}

export interface TrendPagos {
  infracciones: TrendPagoItem[];
  permisos: TrendPagoItem[];
}

export interface DashboardTrends {
  infracciones: TrendItem[];
  permisos: TrendItem[];
  pagos: TrendPagos;
}

// ==========================================
// DISTRIBUCIONES (/dashboard/distributions)
// ==========================================

export interface InfraccionPorTipo {
  tipo: string;
  codigo: string;
  cantidad: number;
}

export interface PagoPorMetodo {
  metodo: string;
  cantidad: number;
  monto: number;
}

export interface PermisoPorEstado {
  estatus: string;
  cantidad: number;
}

export interface TopMunicipio {
  municipio: string;
  codigo: string;
  infracciones: number;
  permisos: number;
  ingresos: number;
}

export interface DashboardDistributions {
  infraccionesPorTipo: InfraccionPorTipo[];
  pagosPorMetodo: PagoPorMetodo[];
  permisosPorEstado: PermisoPorEstado[];
  topMunicipios?: TopMunicipio[];
}
