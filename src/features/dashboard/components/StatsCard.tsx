import { type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'amber';
  loading?: boolean;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  amber: 'bg-amber-50 text-amber-600',
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  loading = false,
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {title}
          </p>
          {loading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded-md bg-gray-200" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', colorMap[color])}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
