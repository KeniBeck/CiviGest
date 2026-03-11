import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DashboardTrends } from '@/types/dashboard.type';
import { TrendingUp } from 'lucide-react';

interface TrendsChartProps {
  data?: DashboardTrends;
  loading?: boolean;
}

const MESES: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function formatMes(mes: string): string {
  const parts = mes.split('-');
  if (parts.length === 2) {
    return `${MESES[parts[1]] ?? parts[1]} ${parts[0].slice(2)}`;
  }
  return mes;
}

export const TrendsChart = ({ data, loading = false }: TrendsChartProps) => {
  if (loading) {
    return (
      <div className="neomorph-card p-5 h-72 animate-pulse">
        <div className="h-4 w-36 bg-gray-300/60 rounded-lg mb-4" />
        <div className="h-52 bg-gray-300/30 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const merged = data.infracciones.map((item) => {
    const permiso = data.permisos.find((p) => p.mes === item.mes);
    return {
      mes: formatMes(item.mes),
      infracciones: item.cantidad,
      permisos: permiso?.cantidad ?? 0,
    };
  });

  return (
    <div className="neomorph-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'hsl(var(--chart-1) / 0.15)', boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.4)' }}
        >
          <TrendingUp className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text, #2d3748)' }}>
            Tendencias Mensuales
          </h3>
          <p className="text-xs text-gray-400">Infracciones y permisos por mes</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={merged} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradInfracciones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradPermisos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.25)" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
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
            labelStyle={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={(value) => (
              <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="infracciones"
            name="Infracciones"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2.5}
            fill="url(#gradInfracciones)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="permisos"
            name="Permisos"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2.5}
            fill="url(#gradPermisos)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
