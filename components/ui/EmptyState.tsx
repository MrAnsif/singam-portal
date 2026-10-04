// components/ui/EmptyState.tsx
// Informative empty states with CTA — never just "No data"
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-neutral-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-neutral-700 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
