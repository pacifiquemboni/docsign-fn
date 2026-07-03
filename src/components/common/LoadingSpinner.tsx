import { cn } from '@/utils/cn';

type Size = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: Size;
  className?: string;
  label?: string;
}

const sizeMap: Record<Size, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
};

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Loading…',
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-r-transparent',
        sizeMap[size],
        className,
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner size="lg" className="text-brand-600" />
    </div>
  );
}
