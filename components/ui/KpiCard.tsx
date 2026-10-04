// components/ui/KpiCard.tsx
// Primary metric card for the dashboard — number, label, trend, icon
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: {
    value: number; // percentage, positive = up, negative = down
    comparedTo: string; // e.g. "vs Aug 2026"
    direction?: 'up-is-good' | 'up-is-bad'; // default: up-is-good
  };
  icon?: React.ReactNode;
  loading?: boolean;
}

export function KpiCard({
  id,
  label,
  value,
  subValue,
  trend,
  icon,
  loading = false,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="skeleton h-4 w-28 mb-3" />
        <div className="skeleton h-8 w-36 mb-2" />
        <div className="skeleton h-3 w-24" />
      </div>
    );
  }

  const trendColor = (() => {
    if (!trend) return '';
    const direction = trend.direction ?? 'up-is-good';
    if (trend.value === 0) return 'text-neutral-500';
    if (direction === 'up-is-good') {
      return trend.value > 0 ? 'text-success-600' : 'text-danger-600';
    }
    return trend.value > 0 ? 'text-danger-600' : 'text-success-600';
  })();

  const TrendIcon =
    !trend || trend.value === 0
      ? Minus
      : trend.value > 0
      ? TrendingUp
      : TrendingDown;

  return (
    <article
      className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors"
      aria-labelledby={id}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium text-neutral-500 truncate"
            id={id}
          >
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-neutral-900 currency tabular-nums leading-none">
            {value}
          </p>
          {subValue && (
            <p className="mt-1 text-xs text-neutral-500">{subValue}</p>
          )}
          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}
              aria-label={`${trend.value > 0 ? 'Up' : trend.value < 0 ? 'Down' : 'No change'} ${Math.abs(trend.value).toFixed(1)}% ${trend.comparedTo}`}
            >
              <TrendIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value.toFixed(1)}% {trend.comparedTo}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </article>
  );
}
