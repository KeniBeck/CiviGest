import type { TopMunicipio } from '@/types/dashboard.type';
import { MapPin } from 'lucide-react';

interface TopMunicipiosTableProps {
  data?: TopMunicipio[];
  loading?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);

export const TopMunicipiosTable = ({ data, loading = false }: TopMunicipiosTableProps) => {
  if (loading) {
    return (
      <div className="neomorph-card p-5 animate-pulse">
        <div className="h-4 w-44 bg-gray-300/60 rounded-lg mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-300/30 rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  if (!data?.length) return null;

  const maxIngresos = Math.max(...data.map((d) => d.ingresos), 1);

  return (
    <div className="neomorph-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: 'hsl(var(--chart-1) / 0.15)',
            boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.4)',
          }}
        >
          <MapPin className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text, #2d3748)' }}>
            Top Municipios
          </h3>
          <p className="text-xs text-gray-400">Por ingresos generados</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {data.map((municipio, index) => {
          const pct = (municipio.ingresos / maxIngresos) * 100;
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div key={municipio.codigo} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none">{medals[index] ?? `#${index + 1}`}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold truncate block" style={{ color: 'var(--color-text, #374151)' }}>
                      {municipio.municipio}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {municipio.infracciones} inf · {municipio.permisos} per
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold ml-2 shrink-0" style={{ color: 'hsl(var(--chart-1))' }}>
                  {formatCurrency(municipio.ingresos)}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full w-full"
                style={{
                  background: 'rgba(163,177,198,0.3)',
                  boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.3)',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-2)))`,
                    boxShadow: `0 0 6px hsl(var(--chart-1) / 0.4)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
