import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useUserLevel } from '@/hooks/useUserLevel';
import {
  useDashboardMetrics,
  useDashboardTrends,
  useDashboardDistributions,
  dashboardKeys,
} from '@/hooks/queries/useDashboard';
import type { DashboardFiltersDto } from '@/types/dashboard.type';
import {
  StatsGroupCard,
  FinanzasHeroCard,
  TrendsChart,
  InfraccionesPorTipoChart,
  PagosPorMetodoChart,
  PermisosPorEstadoChart,
  TopMunicipiosTable,
  DashboardFilters,
} from '@/components/features/dashboard';
import {
  Building2,
  Users,
  AlertTriangle,
  FileText,
  BarChart3,
  MapPin,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { userLevel } = useUserLevel();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<DashboardFiltersDto>({});

  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics(filters);
  const { data: trends, isLoading: loadingTrends } = useDashboardTrends(filters);
  const { data: distributions, isLoading: loadingDistributions } = useDashboardDistributions(filters);

  const isLoading = loadingMetrics || loadingTrends || loadingDistributions;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }, [queryClient]);

  const handleFiltersChange = useCallback((newFilters: DashboardFiltersDto) => {
    setFilters(newFilters);
  }, []);

  const roleLabel =
    userLevel === 'SUPER_ADMIN'
      ? 'Super Administrador'
      : userLevel === 'ESTATAL'
        ? 'Administrador Estatal'
        : userLevel === 'MUNICIPAL'
          ? 'Administrador Municipal'
          : 'Operativo';

  // ── Construir stats de infracciones ──
  const infTotal = metrics?.infracciones.total ?? 0;
  const infStats = [
    {
      label: 'Pagadas',
      value: metrics?.infracciones.pagadas ?? 0,
      color: 'hsl(var(--chart-2))',
      pct: infTotal > 0 ? ((metrics?.infracciones.pagadas ?? 0) / infTotal) * 100 : 0,
    },
    {
      label: 'Pendientes',
      value: metrics?.infracciones.pendientes ?? 0,
      color: 'hsl(var(--chart-5))',
      pct: infTotal > 0 ? ((metrics?.infracciones.pendientes ?? 0) / infTotal) * 100 : 0,
    },
    ...(metrics && 'vencidas' in metrics.infracciones
      ? [{
          label: 'Vencidas',
          value: metrics.infracciones.vencidas,
          color: 'hsl(var(--chart-3))',
          pct: infTotal > 0 ? (metrics.infracciones.vencidas / infTotal) * 100 : 0,
        }]
      : []),
  ];

  // ── Construir stats de permisos ──
  const perTotal = metrics?.permisos.total ?? 0;
  const perStats = [
    {
      label: 'Aprobados',
      value: metrics?.permisos.aprobados ?? 0,
      color: 'hsl(var(--chart-2))',
      pct: perTotal > 0 ? ((metrics?.permisos.aprobados ?? 0) / perTotal) * 100 : 0,
    },
    {
      label: 'Pendientes',
      value: metrics?.permisos.pendientes ?? 0,
      color: 'hsl(var(--chart-5))',
      pct: perTotal > 0 ? ((metrics?.permisos.pendientes ?? 0) / perTotal) * 100 : 0,
    },
    ...(metrics && 'enRevision' in metrics.permisos
      ? [{
          label: 'En Revisión',
          value: metrics.permisos.enRevision,
          color: 'hsl(var(--chart-4))',
          pct: perTotal > 0 ? (metrics.permisos.enRevision / perTotal) * 100 : 0,
        }]
      : []),
  ];

  // ── Stats de organización ──
  const orgStats: Array<{ icon: typeof Building2; label: string; value: number; color: string }> = [];
  if (metrics) {
    if ('totalSedes' in metrics.organizacion) {
      orgStats.push({ icon: Building2, label: 'Sedes', value: metrics.organizacion.totalSedes, color: 'hsl(var(--chart-1))' });
      orgStats.push({ icon: MapPin, label: 'Municipios', value: metrics.organizacion.totalSubsedes, color: 'hsl(var(--chart-2))' });
    } else if ('totalMunicipios' in metrics.organizacion) {
      orgStats.push({ icon: MapPin, label: 'Municipios', value: metrics.organizacion.totalMunicipios, color: 'hsl(var(--chart-2))' });
    }
    orgStats.push({ icon: Users, label: 'Usuarios', value: metrics.organizacion.totalUsuarios, color: 'hsl(var(--chart-4))' });
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{
                  background: 'hsl(var(--chart-1) / 0.15)',
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.5)',
                }}
              >
                <BarChart3 className="h-5 w-5" style={{ color: 'hsl(var(--chart-1))' }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary, #2d3748)' }}>
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              Bienvenido, <strong>{user?.firstName}</strong>
              <span className="text-gray-400"> · {roleLabel}</span>
            </p>
          </div>
        </div>

        {/* ── Filtros ── */}
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          userLevel={userLevel}
        />

        {/* ══════════════════════════════════════
            FILA 1: Finanzas Hero + Stats combinadas
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Finanzas Hero - ocupa 1 columna */}
          <FinanzasHeroCard data={metrics?.finanzas} loading={loadingMetrics} />

          {/* Infracciones Stats */}
          <StatsGroupCard
            title="Infracciones"
            icon={AlertTriangle}
            iconColor="hsl(var(--chart-3))"
            total={metrics?.infracciones.total}
            totalLabel="total"
            stats={infStats}
            loading={loadingMetrics}
          />

          {/* Permisos Stats */}
          <StatsGroupCard
            title="Permisos"
            icon={FileText}
            iconColor="hsl(var(--chart-1))"
            total={metrics?.permisos.total}
            totalLabel="total"
            stats={perStats}
            loading={loadingMetrics}
          />
        </div>

        {/* ══════════════════════════════════════
            FILA 2: Chips de organización
        ══════════════════════════════════════ */}
        {(loadingMetrics || orgStats.length > 0) && (
          <div className="flex flex-wrap gap-3">
            {loadingMetrics
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-36 neomorph-flat rounded-xl animate-pulse bg-gray-300/40" />
                ))
              : orgStats.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                    style={{
                      background: '#e0e5ec',
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.5)',
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-6 h-6 rounded-lg"
                      style={{ background: `${item.color}20` }}
                    >
                      <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text, #374151)' }}>
                      {item.value.toLocaleString('es-MX')}
                    </span>
                    <span className="text-xs text-gray-400">{item.label}</span>
                  </div>
                ))}
          </div>
        )}

        {/* ══════════════════════════════════════
            FILA 3: Tendencias (full width)
        ══════════════════════════════════════ */}
        <TrendsChart data={trends} loading={loadingTrends} />

        {/* ══════════════════════════════════════
            FILA 4 + 5: Distribuciones en grid 2x2
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InfraccionesPorTipoChart
            data={distributions?.infraccionesPorTipo}
            loading={loadingDistributions}
          />
          <PagosPorMetodoChart
            data={distributions?.pagosPorMetodo}
            loading={loadingDistributions}
          />
          <PermisosPorEstadoChart
            data={distributions?.permisosPorEstado}
            loading={loadingDistributions}
          />
          {(userLevel === 'SUPER_ADMIN' || userLevel === 'ESTATAL') &&
            (loadingDistributions || (distributions?.topMunicipios?.length ?? 0) > 0) && (
              <TopMunicipiosTable
                data={distributions?.topMunicipios}
                loading={loadingDistributions}
              />
            )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
