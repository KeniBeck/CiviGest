import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DashboardDistributions } from '@/types/dashboard.type';
import { FileCheck } from 'lucide-react';

interface PermisosPorEstadoChartProps {
  data?: DashboardDistributions['permisosPorEstado'];
  loading?: boolean;
}

const ESTATUS_CONFIG: Record<string, { label: string; color: string }> = {
  APROBADO: { label: 'Aprobado', color: 'hsl(var(--chart-2))' },
  SOLICITADO: { label: 'Solicitado', color: 'hsl(var(--chart-1))' },
  EN_REVISION: { label: 'En revisión', color: 'hsl(var(--chart-5))' },
  RECHAZADO: { label: 'Rechazado', color: 'hsl(var(--chart-3))' },
  CANCELADO: { label: 'Cancelado', color: 'hsl(var(--chart-4))' },
};

export const PermisosPorEstadoChart = ({
  data,
  loading = false,
}: PermisosPorEstadoChartProps) => {
  if (loading) {
    return (
      <div className="neomorph-card p-5 h-72 animate-pulse">
        <div className="h-4 w-40 bg-gray-300/60 rounded-lg mb-4" />
        <div className="h-52 bg-gray-300/30 rounded-xl" />
      </div>
    );
  }

  if (!data?.length) return null;

  const chartData = data.map((d) => ({
    estatus: ESTATUS_CONFIG[d.estatus]?.label ?? d.estatus,
    cantidad: d.cantidad,
    color: ESTATUS_CONFIG[d.estatus]?.color ?? 'hsl(var(--chart-1))',
  }));

  return (
    <div className="neomorph-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: 'hsl(var(--chart-2) / 0.15)',
            boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.4)',
          }}
        >
          <FileCheck className="h-4 w-4" style={{ color: 'hsl(var(--chart-2))' }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text, #2d3748)' }}>
            Permisos por Estado
          </h3>
          <p className="text-xs text-gray-400">Distribución de estatus</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.25)" vertical={false} />
          <XAxis
            dataKey="estatus"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: '#e0e5ec',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '6px 6px 12px rgba(163,177,198,0.5), -6px -6px 12px rgba(255,255,255,0.5)',
              fontSize: '12px',
            }}
            formatter={(value) => [Number(value ?? 0).toLocaleString('es-MX'), 'Permisos']}
          />
          <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
