import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DashboardDistributions } from '@/types/dashboard.type';
import { CreditCard } from 'lucide-react';

interface PagosPorMetodoChartProps {
  data?: DashboardDistributions['pagosPorMetodo'];
  loading?: boolean;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-3))',
];

const METODO_LABELS: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA_DEBITO: 'Débito',
  TARJETA_CREDITO: 'Crédito',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);

export const PagosPorMetodoChart = ({
  data,
  loading = false,
}: PagosPorMetodoChartProps) => {
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
    ...d,
    name: METODO_LABELS[d.metodo] ?? d.metodo,
  }));

  const total = chartData.reduce((sum, d) => sum + d.cantidad, 0);

  return (
    <div className="neomorph-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: 'hsl(var(--chart-4) / 0.15)',
            boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.4)',
          }}
        >
          <CreditCard className="h-4 w-4" style={{ color: 'hsl(var(--chart-4))' }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text, #2d3748)' }}>
            Pagos por Método
          </h3>
          <p className="text-xs text-gray-400">{total.toLocaleString('es-MX')} pagos totales</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="cantidad"
            nameKey="name"
            strokeWidth={0}
          >
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                opacity={0.88}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#e0e5ec',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '6px 6px 12px rgba(163,177,198,0.5), -6px -6px 12px rgba(255,255,255,0.5)',
              fontSize: '12px',
            }}
            formatter={(value, _name, props) => [
              <span key="val">
                <strong>{Number(value ?? 0).toLocaleString('es-MX')}</strong> pagos
                <br />
                <span className="text-gray-500">
                  {formatCurrency((props as { payload?: { monto?: number } }).payload?.monto ?? 0)}
                </span>
              </span>,
              '',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
