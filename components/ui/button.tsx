import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants = {
      default: 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs',
      outline:
        'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 shadow-xs',
      secondary:
        'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
      ghost: 'hover:bg-neutral-100 hover:text-neutral-900 text-neutral-600',
      link: 'text-brand-600 underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-9 px-3 py-2',
      sm: 'h-8 rounded-md px-2.5 text-xs',
      lg: 'h-10 rounded-md px-4',
      icon: 'h-9 w-9',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
