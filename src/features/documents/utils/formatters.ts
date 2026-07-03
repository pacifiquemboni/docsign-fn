import type { DocumentStatus } from '../types';

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  UPLOADED: 'Uploaded',
  PROCESSING: 'Processing',
  READY: 'Ready',
  SIGNED: 'Signed',
  ARCHIVED: 'Archived',
  DELETED: 'Deleted',
};

export const STATUS_VARIANTS: Record<
  DocumentStatus,
  'blue' | 'yellow' | 'green' | 'purple' | 'gray' | 'red'
> = {
  UPLOADED: 'blue',
  PROCESSING: 'yellow',
  READY: 'green',
  SIGNED: 'purple',
  ARCHIVED: 'gray',
  DELETED: 'red',
};
