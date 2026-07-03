import { CheckCircle2, Clock, Eye, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { RecipientStatus } from '../../types';

interface RecipientStatusBadgeProps {
  status: RecipientStatus;
}

const CONFIG: Record<RecipientStatus, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING:  { label: 'Pending',  icon: <Clock className="h-3 w-3" />,        className: 'text-gray-400' },
  VIEWED:   { label: 'Viewed',   icon: <Eye className="h-3 w-3" />,          className: 'text-amber-500' },
  SIGNED:   { label: 'Signed',   icon: <CheckCircle2 className="h-3 w-3" />, className: 'text-emerald-500' },
  DECLINED: { label: 'Declined', icon: <XCircle className="h-3 w-3" />,      className: 'text-red-500' },
  EXPIRED:  { label: 'Expired',  icon: <AlertCircle className="h-3 w-3" />,  className: 'text-gray-400' },
};

export function RecipientStatusBadge({ status }: RecipientStatusBadgeProps) {
  const cfg = CONFIG[status] ?? { label: status, icon: null, className: 'text-gray-400' };
  return (
    <span className={cn('flex items-center gap-1 text-xs font-medium', cfg.className)}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
