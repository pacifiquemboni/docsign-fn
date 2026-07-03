import { FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/formatters';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface UploadProgressCardProps {
  file: File;
  state: UploadState;
  progress: number;
  error?: string | null;
  onCancel: () => void;
  onReset: () => void;
}

export function UploadProgressCard({
  file,
  state,
  progress,
  error,
  onCancel,
  onReset,
}: UploadProgressCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            state === 'success' ? 'bg-green-50' : 'bg-brand-50',
            state === 'error' && 'bg-red-50',
          )}
        >
          {state === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : state === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <FileText className="h-5 w-5 text-brand-600" />
          )}
        </div>

        {/* File info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className="truncate text-sm font-medium text-gray-900"
              title={file.name}
            >
              {file.name}
            </p>
            <span className="shrink-0 text-xs text-gray-400">
              {formatFileSize(file.size)}
            </span>
          </div>

          {/* Progress bar */}
          {(state === 'uploading' || state === 'idle') && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {state === 'uploading'
                  ? `Uploading… ${progress}%`
                  : 'Preparing upload…'}
              </p>
            </div>
          )}

          {state === 'success' && (
            <p className="mt-1 text-xs font-medium text-green-600">
              Upload complete
            </p>
          )}

          {state === 'error' && (
            <p className="mt-1 text-xs text-red-600">{error ?? 'Upload failed'}</p>
          )}
        </div>

        {/* Action */}
        <div className="shrink-0">
          {(state === 'uploading' || state === 'idle') && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={onCancel}
              aria-label="Cancel upload"
            />
          )}
          {(state === 'success' || state === 'error') && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              {state === 'error' ? 'Retry' : 'Upload another'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
