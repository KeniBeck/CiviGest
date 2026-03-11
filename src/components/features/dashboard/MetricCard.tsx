import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  className?: string;
  loading?: boolean;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'var(--color-primary)',
  trend,
  trendLabel,
  className,
  loading = false,
}: MetricCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-emerald-500'
      : trend === 'down'
        ? 'text-rose-500'
        : 'text-gray-400';

  if (loading) {
    return (
      <div className={cn('neomorph-card p-5 animate-pulse', className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="h-4 w-28 bg-gray-300/60 rounded-lg" />
          <div className="h-10 w-10 rounded-xl bg-gray-300/60" />
        </div>
        <div className="h-8 w-20 bg-gray-300/60 rounded-lg mb-2" />
        <div className="h-3 w-24 bg-gray-300/40 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn('neomorph-card p-5 group cursor-default', className)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-500 leading-tight pr-2">{title}</p>
        <div
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `${iconColor}18`,
            boxShadow: `4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.5)`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>

      <p
        className="text-3xl font-bold tracking-tight mb-1"
        style={{ color: 'var(--color-text, #2d3748)' }}
      >
        {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
      </p>

      {(subtitle || (trend && trendLabel)) && (
        <div className="flex items-center gap-1.5 mt-1">
          {trend && (
            <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} />
          )}
          <p className={cn('text-xs', trend ? trendColor : 'text-gray-400')}>
            {trendLabel || subtitle}
          </p>
        </div>
      )}
    </div>
  );
};
