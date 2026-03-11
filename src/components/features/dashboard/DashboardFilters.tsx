import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Filter, X } from 'lucide-react';
import { useSedes } from '@/hooks/queries/useSedes';
import { useSubsedes } from '@/hooks/queries/useSubsedes';
import type { DashboardFiltersDto } from '@/types/dashboard.type';
import type { UserLevel } from '@/hooks/useUserLevel';

interface DashboardFiltersProps {
  filters: DashboardFiltersDto;
  onFiltersChange: (filters: DashboardFiltersDto) => void;
  onRefresh: () => void;
  isLoading: boolean;
  userLevel: UserLevel;
}

const RANGOS_RAPIDOS = [
  { label: 'Último mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
  { label: 'Últimos 6 meses', days: 180 },
  { label: 'Último año', days: 365 },
];

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export const DashboardFilters = ({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
  userLevel,
}: DashboardFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const { data: sedesData } = useSedes({ page: 1, limit: 100 });
  const { data: subsedesData } = useSubsedes({
    page: 1,
    limit: 100,
    sedeId: filters.sedeId,
  });

  const sedes = sedesData?.items ?? [];
  const subsedes = subsedesData?.items ?? [];

  const handleRangoRapido = (days: number) => {
    onFiltersChange({
      ...filters,
      fechaInicio: daysAgo(days) + 'T00:00:00.000Z',
      fechaFin: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    !!filters.fechaInicio || !!filters.fechaFin || !!filters.sedeId || !!filters.subsedeId;

  return (
    <div className="neomorph-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Rangos rápidos */}
        <div className="flex flex-wrap gap-2">
          {RANGOS_RAPIDOS.map((rango) => (
            <button
              key={rango.days}
              onClick={() => handleRangoRapido(rango.days)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
              style={{
                background: '#e0e5ec',
                color: '#6b7280',
                boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.5)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  'inset 3px 3px 6px rgba(163,177,198,0.4), inset -3px -3px 6px rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.5)';
              }}
            >
              {rango.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="gap-1.5 text-xs"
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {hasActiveFilters && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(var(--chart-1))' }}
              />
            )}
          </Button>

          <Button
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200/60 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Fecha inicio</Label>
            <Input
              type="date"
              value={filters.fechaInicio ? filters.fechaInicio.split('T')[0] : ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  fechaInicio: e.target.value ? e.target.value + 'T00:00:00.000Z' : undefined,
                })
              }
              className="h-8 text-xs neomorph-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Fecha fin</Label>
            <Input
              type="date"
              value={filters.fechaFin ? filters.fechaFin.split('T')[0] : ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  fechaFin: e.target.value ? e.target.value + 'T23:59:59.000Z' : undefined,
                })
              }
              className="h-8 text-xs neomorph-input"
            />
          </div>

          {userLevel === 'SUPER_ADMIN' && sedes.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Sede</Label>
              <Select
                value={filters.sedeId ? String(filters.sedeId) : 'all'}
                onValueChange={(v) =>
                  onFiltersChange({
                    ...filters,
                    sedeId: v !== 'all' ? Number(v) : undefined,
                    subsedeId: undefined,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todas las sedes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sedes</SelectItem>
                  {sedes.map((sede: { id: number; name: string }) => (
                    <SelectItem key={sede.id} value={String(sede.id)}>
                      {sede.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(userLevel === 'SUPER_ADMIN' || userLevel === 'ESTATAL') && subsedes.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Subsede</Label>
              <Select
                value={filters.subsedeId ? String(filters.subsedeId) : 'all'}
                onValueChange={(v) =>
                  onFiltersChange({ ...filters, subsedeId: v !== 'all' ? Number(v) : undefined })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todas las subsedes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las subsedes</SelectItem>
                  {subsedes.map((sub: { id: number; name: string }) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
