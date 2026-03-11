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
import { AlertTriangle } from 'lucide-react';

interface InfraccionesPorTipoChartProps {
  data?: DashboardDistributions['infraccionesPorTipo'];
  loading?: boolean;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const InfraccionesPorTipoChart = ({
  data,
  loading = false,
}: InfraccionesPorTipoChartProps) => {
  if (loading) {
    return (
      <div className="neomorph-card p-5 h-72 animate-pulse">
        <div className="h-4 w-40 bg-gray-300/60 rounded-lg mb-4" />
        <div className="h-52 bg-gray-300/30 rounded-xl" />
      </div>
    );
  }

  if (!data?.length) return null;

  const sorted = [...data].sort((a, b) => b.cantidad - a.cantidad).slice(0, 6);

  return (
    <div className="neomorph-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: 'hsl(var(--chart-3) / 0.15)',
            boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.4)',
          }}
        >
          <AlertTriangle className="h-4 w-4" style={{ color: 'hsl(var(--chart-3))' }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text, #2d3748)' }}>
            Infracciones por Tipo
          </h3>
          <p className="text-xs text-gray-400">Top tipos de infracción</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.25)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="tipo"
            width={130}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: string) => (v.length > 20 ? v.slice(0, 18) + '…' : v)}
          />
          <Tooltip
            contentStyle={{
              background: '#e0e5ec',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '6px 6px 12px rgba(163,177,198,0.5), -6px -6px 12px rgba(255,255,255,0.5)',
              fontSize: '12px',
            }}
            formatter={(value) => [Number(value ?? 0).toLocaleString('es-MX'), 'Cantidad']}
          />
          <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {sorted.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
