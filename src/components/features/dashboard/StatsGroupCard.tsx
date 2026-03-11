import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: number | string;
  color?: string;
  pct?: number;
}

interface StatsGroupCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  total?: number | string;
  totalLabel?: string;
  stats: StatItem[];
  loading?: boolean;
  className?: string;
}

export const StatsGroupCard = ({
  title,
  icon: Icon,
  iconColor,
  total,
  totalLabel,
  stats,
  loading = false,
  className,
}: StatsGroupCardProps) => {
  if (loading) {
    return (
      <div className={cn('neomorph-card p-5 animate-pulse', className)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gray-300/60" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-gray-300/60 rounded" />
            <div className="h-7 w-16 bg-gray-300/50 rounded" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-3">
            <div className="h-3 w-28 bg-gray-300/40 rounded mb-1.5" />
            <div className="h-1.5 w-full bg-gray-300/30 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('neomorph-card p-5', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl"
          style={{
            background: `${iconColor}18`,
            boxShadow: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.5)',
          }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          {total !== undefined && (
            <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--color-text, #2d3748)' }}>
              {typeof total === 'number' ? total.toLocaleString('es-MX') : total}
              {totalLabel && (
                <span className="text-xs font-normal text-gray-400 ml-1">{totalLabel}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Stats con progress bar */}
      <div className="space-y-3">
        {stats.map((stat, i) => {
          const numVal = typeof stat.value === 'number' ? stat.value : parseInt(String(stat.value), 10) || 0;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{stat.label}</span>
                <span className="text-xs font-semibold" style={{ color: stat.color ?? 'var(--color-text, #374151)' }}>
                  {typeof stat.value === 'number' ? numVal.toLocaleString('es-MX') : stat.value}
                </span>
              </div>
              {stat.pct !== undefined && (
                <div
                  className="h-1.5 rounded-full w-full overflow-hidden"
                  style={{
                    background: 'rgba(163,177,198,0.3)',
                    boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.3)',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(stat.pct, 100)}%`,
                      background: stat.color ?? 'hsl(var(--chart-1))',
                      boxShadow: `0 0 4px ${stat.color ?? 'hsl(var(--chart-1))'}60`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
