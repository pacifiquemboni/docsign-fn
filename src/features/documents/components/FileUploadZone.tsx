import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  error?: string | null;
}

export function FileUploadZone({
  onFileSelect,
  disabled = false,
  error,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) return;
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE_BYTES,
    maxFiles: 1,
    disabled,
  });

  const isError = isDragReject || Boolean(error);

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        !disabled && !isError && 'border-gray-200 hover:border-brand-400 hover:bg-brand-50/30',
        isDragActive && !isDragReject && 'border-brand-500 bg-brand-50',
        isError && 'border-red-300 bg-red-50',
        disabled && 'cursor-not-allowed opacity-60',
      )}
      aria-label="File upload zone"
    >
      <input {...getInputProps()} />

      <div
        className={cn(
          'mb-4 flex h-14 w-14 items-center justify-center rounded-full',
          isDragActive && !isDragReject ? 'bg-brand-100' : 'bg-gray-100',
          isError && 'bg-red-100',
        )}
      >
        {isError ? (
          <AlertCircle className="h-7 w-7 text-red-500" strokeWidth={1.5} />
        ) : isDragActive ? (
          <FileText className="h-7 w-7 text-brand-600" strokeWidth={1.5} />
        ) : (
          <Upload className="h-7 w-7 text-gray-400" strokeWidth={1.5} />
        )}
      </div>

      {isDragActive && !isDragReject ? (
        <p className="text-sm font-medium text-brand-700">Drop your PDF here</p>
      ) : isError ? (
        <p className="text-sm font-medium text-red-700">
          {error ?? 'Only PDF files up to 50 MB are accepted'}
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">
            Drop your PDF here, or{' '}
            <span className="text-brand-600 underline underline-offset-2">
              browse files
            </span>
          </p>
          <p className="mt-1.5 text-xs text-gray-400">PDF only · Max 50 MB</p>
        </>
      )}
    </div>
  );
}
