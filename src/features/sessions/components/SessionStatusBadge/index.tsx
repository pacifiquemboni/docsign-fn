import { cn } from '@/utils/cn';
import type { SessionStatus } from '../../types';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  size?: 'sm' | 'md';
}

const CONFIG: Record<SessionStatus, { label: string; className: string }> = {
  DRAFT:       { label: 'Draft',       className: 'bg-gray-100 text-gray-600' },
  SENT:        { label: 'Sent',        className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
  COMPLETED:   { label: 'Completed',   className: 'bg-emerald-100 text-emerald-700' },
  DECLINED:    { label: 'Declined',    className: 'bg-red-100 text-red-600' },
  EXPIRED:     { label: 'Expired',     className: 'bg-gray-100 text-gray-500' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-500' },
};

export function SessionStatusBadge({ status, size = 'sm' }: SessionStatusBadgeProps) {
  const { label, className } = CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      {label}
    </span>
  );
}
