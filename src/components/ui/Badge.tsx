import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant =
  | 'default'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'purple'
  | 'gray';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  green: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  gray: 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20',
};

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
