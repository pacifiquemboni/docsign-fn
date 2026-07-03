import { Badge } from '@/components/ui/Badge';
import { STATUS_LABELS, STATUS_VARIANTS } from '../utils/formatters';
import type { DocumentStatus } from '../types';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
