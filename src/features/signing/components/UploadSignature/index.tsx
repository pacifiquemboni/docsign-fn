import { useCallback, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface UploadSignatureProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const ACCEPT = '.png,.jpg,.jpeg';
const MAX_BYTES = 10 * 1024 * 1024;

export function UploadSignature({ file, onChange }: UploadSignatureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (f: File | null) => {
      setError(null);
      if (!f) { onChange(null); setPreviewUrl(null); return; }

      if (f.size > MAX_BYTES) {
        setError('File must be under 10 MB.');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(f.type)) {
        setError('Only PNG and JPEG files are accepted.');
        return;
      }

      const url = URL.createObjectURL(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      onChange(f);
    },
    [onChange, previewUrl],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files?.[0] ?? null);
    },
    [handleFile],
  );

  const handleClear = () => {
    onChange(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload signature image"
      />

      {previewUrl ? (
        <div className="relative flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <img
            src={previewUrl}
            alt="Signature preview"
            className="max-h-32 w-auto object-contain"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-xs text-gray-400 truncate max-w-full">{file?.name}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 text-gray-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
          aria-label="Drop a signature image or click to browse"
        >
          <Upload className="h-8 w-8" />
          <span className="text-sm font-medium">Drop image or click to browse</span>
          <span className="text-xs">PNG or JPEG · max 10 MB</span>
        </button>
      )}

      {error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
