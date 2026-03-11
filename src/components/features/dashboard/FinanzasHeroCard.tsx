import type { MetricasFinanzas } from '@/types/dashboard.type';
import { Wallet, TrendingUp } from 'lucide-react';

interface FinanzasHeroCardProps {
  data?: MetricasFinanzas;
  loading?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);

export const FinanzasHeroCard = ({ data, loading = false }: FinanzasHeroCardProps) => {
  if (loading) {
    return (
      <div className="neomorph-card p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-gray-300/60" />
          <div className="h-5 w-20 bg-gray-300/40 rounded-full" />
        </div>
        <div className="h-10 w-40 bg-gray-300/50 rounded-lg mb-2" />
        <div className="h-3 w-28 bg-gray-300/40 rounded mb-6" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 bg-gray-300/30 rounded-xl" />
          <div className="h-14 bg-gray-300/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pctInfracciones = data.montoTotal > 0
    ? (data.montoInfracciones / data.montoTotal) * 100
    : 0;
  const pctPermisos = data.montoTotal > 0
    ? (data.montoPermisos / data.montoTotal) * 100
    : 0;

  return (
    <div className="neomorph-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{
            background: 'hsl(var(--chart-2) / 0.15)',
            boxShadow: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.5)',
          }}
        >
          <Wallet className="h-5 w-5" style={{ color: 'hsl(var(--chart-2))' }} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: 'hsl(var(--chart-2) / 0.12)',
            color: 'hsl(var(--chart-2))',
          }}
        >
          <TrendingUp className="h-3 w-3" />
          Ingresos
        </div>
      </div>

      <p
        className="text-3xl sm:text-4xl font-bold tracking-tight"
        style={{ color: 'var(--color-text, #1a202c)' }}
      >
        {formatCurrency(data.montoTotal)}
      </p>
      <p className="text-xs text-gray-400 mt-1 mb-5">Total acumulado en el período</p>

      {/* Desglose */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3"
          style={{
            background: 'hsl(var(--chart-3) / 0.08)',
            boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.3)',
          }}
        >
          <p className="text-[10px] text-gray-400 mb-1">Infracciones</p>
          <p className="text-sm font-bold" style={{ color: 'hsl(var(--chart-3))' }}>
            {formatCurrency(data.montoInfracciones)}
          </p>
          <div className="mt-1.5 h-1 rounded-full" style={{ background: 'rgba(163,177,198,0.2)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pctInfracciones}%`,
                background: 'hsl(var(--chart-3))',
                boxShadow: '0 0 4px hsl(var(--chart-3) / 0.5)',
              }}
            />
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{
            background: 'hsl(var(--chart-1) / 0.08)',
            boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.3)',
          }}
        >
          <p className="text-[10px] text-gray-400 mb-1">Permisos</p>
          <p className="text-sm font-bold" style={{ color: 'hsl(var(--chart-1))' }}>
            {formatCurrency(data.montoPermisos)}
          </p>
          <div className="mt-1.5 h-1 rounded-full" style={{ background: 'rgba(163,177,198,0.2)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pctPermisos}%`,
                background: 'hsl(var(--chart-1))',
                boxShadow: '0 0 4px hsl(var(--chart-1) / 0.5)',
              }}
            />
          </div>
        </div>
      </div>

      {'totalPagosInfracciones' in data && (
        <p className="text-[10px] text-gray-400 mt-3 text-center">
          {(data.totalPagosInfracciones + data.totalPagosPermisos).toLocaleString('es-MX')} transacciones registradas
        </p>
      )}
    </div>
  );
};
