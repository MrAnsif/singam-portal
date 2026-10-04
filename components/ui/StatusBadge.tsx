// components/ui/StatusBadge.tsx
// Consistent status/category badges — always includes icon+text, never color alone
import { CheckCircle2, Clock, Edit3, AlertTriangle, XCircle } from 'lucide-react';

type BadgeVariant =
  | 'complete'
  | 'draft'
  | 'edited'
  | 'warning'
  | 'danger'
  | 'neutral';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  status?: string;
  label?: string;
  size?: 'sm' | 'md';
}

const CONFIG: Record<
  BadgeVariant,
  { icon: React.ElementType; className: string }
> = {
  complete: {
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  draft: {
    icon: Clock,
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  edited: {
    icon: Edit3,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  danger: {
    icon: XCircle,
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  neutral: {
    icon: Clock,
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
};

export function StatusBadge({
  variant,
  status,
  label,
  size = 'sm',
}: StatusBadgeProps) {
  const resolvedVariant: BadgeVariant = (variant || status || 'neutral') as BadgeVariant;
  const config = CONFIG[resolvedVariant] || CONFIG.neutral;
  const Icon = config.icon;
  const displayLabel = label || resolvedVariant.charAt(0).toUpperCase() + resolvedVariant.slice(1);
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClass}`}
    >
      <Icon
        className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
        aria-hidden="true"
      />
      {displayLabel}
    </span>
  );
}
