import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, CheckSquare, Square, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { getThumbnailUrl } from '../../utils/thumbnailUrl';
import type {
  DocumentPage,
  InsertFromSourceRequest,
  InsertPosition,
  UploadSourceResponse,
} from '../../types';

type Step = 'upload' | 'select';

interface InsertPdfModalProps {
  open: boolean;
  targetPageNumber: number;
  documentId: string;
  isInserting: boolean;
  onUpload: (file: File) => Promise<UploadSourceResponse | null>;
  uploadProgress: number;
  uploadPending: boolean;
  uploadError: string | null;
  onInsert: (req: InsertFromSourceRequest) => void;
  onCancel: () => void;
}

function UploadStep({
  onFile,
  progress,
  pending,
  error,
}: {
  onFile: (f: File) => void;
  progress: number;
  pending: boolean;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') onFile(file);
    },
    [onFile],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !pending && inputRef.current?.click()}
        className={cn(
          'flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2',
          'rounded-xl border-2 border-dashed transition-colors',
          dragging
            ? 'border-brand-400 bg-brand-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400',
          pending && 'pointer-events-none opacity-60',
        )}
      >
        <Upload className="h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-600">
          {pending ? 'Uploading…' : 'Drop PDF here or click to browse'}
        </p>
        {!pending && (
          <p className="text-xs text-gray-400">PDF only · max 50 MB</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>

      {pending && (
        <div className="w-full">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Uploading and processing…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function PageSelectGrid({
  pages,
  selected,
  onToggle,
}: {
  pages: DocumentPage[];
  selected: Set<number>;
  onToggle: (pn: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-1" style={{ maxHeight: 320 }}>
      {pages.map((page) => {
        const isSelected = selected.has(page.page_number);
        const thumbUrl = getThumbnailUrl(page.thumbnail_path);
        return (
          <button
            key={page.id}
            type="button"
            onClick={() => onToggle(page.page_number)}
            className={cn(
              'relative flex flex-col items-center gap-1 rounded-lg border-2 p-1 transition-all',
              isSelected
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300',
            )}
          >
            <div
              className="w-full overflow-hidden rounded bg-gray-100"
              style={{ aspectRatio: `${page.page_width} / ${page.page_height}` }}
            >
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={`Page ${page.page_number}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  No preview
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">{page.page_number}</span>

            <div className="absolute right-1 top-1">
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-brand-500" />
              ) : (
                <Square className="h-4 w-4 text-gray-300" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function InsertPdfModal({
  open,
  targetPageNumber,
  documentId,
  isInserting,
  onUpload,
  uploadProgress,
  uploadPending,
  uploadError,
  onInsert,
  onCancel,
}: InsertPdfModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [source, setSource] = useState<UploadSourceResponse | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [position, setPosition] = useState<InsertPosition>('after');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('upload');
      setSource(null);
      setSelected(new Set());
      setPosition('after');
    }
  }, [open]);

  if (!open) return null;

  const handleFile = async (file: File) => {
    const result = await onUpload(file);
    if (result) {
      setSource(result);
      setSelected(new Set(result.pages.map((p) => p.page_number)));
      setStep('select');
    }
  };

  const togglePage = (pn: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pn)) next.delete(pn);
      else next.add(pn);
      return next;
    });
  };

  const toggleAll = () => {
    if (!source) return;
    const all = source.pages.map((p) => p.page_number);
    if (selected.size === all.length) setSelected(new Set());
    else setSelected(new Set(all));
  };

  const handleInsert = () => {
    if (!source || selected.size === 0) return;
    // Send in the original page order
    const orderedPages = (source.pages ?? [])
      .map((p) => p.page_number)
      .filter((pn) => selected.has(pn));
    onInsert({
      source_document_id: source.source_document_id,
      pages: orderedPages,
      position,
      target_page: targetPageNumber,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-xl border border-gray-100 bg-white p-6 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      onCancel={onCancel}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        {step === 'select' && (
          <button
            type="button"
            onClick={() => setStep('upload')}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <h2 className="text-base font-semibold text-gray-900">
          {step === 'upload' ? 'Insert PDF Pages' : `Select pages from "${source?.original_name}"`}
        </h2>
      </div>

      {/* Step: upload */}
      {step === 'upload' && (
        <UploadStep
          onFile={handleFile}
          progress={uploadProgress}
          pending={uploadPending}
          error={uploadError}
        />
      )}

      {/* Step: select */}
      {step === 'select' && source && (
        <>
          {/* Select all toggle */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {selected.size} of {source.page_count} pages selected
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              {selected.size === source.page_count ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <PageSelectGrid
            pages={source.pages}
            selected={selected}
            onToggle={togglePage}
          />

          {/* Position */}
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
              Insert Position
            </p>
            <div className="flex gap-2">
              {(['before', 'after'] as InsertPosition[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={cn(
                    'flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-colors',
                    position === pos
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  )}
                >
                  {pos === 'before' ? `Before page ${targetPageNumber}` : `After page ${targetPageNumber}`}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isInserting}>
          Cancel
        </Button>
        {step === 'select' && (
          <Button
            size="sm"
            loading={isInserting}
            disabled={selected.size === 0}
            onClick={handleInsert}
          >
            Insert {selected.size > 0 ? `${selected.size} page${selected.size > 1 ? 's' : ''}` : ''}
          </Button>
        )}
      </div>
    </dialog>
  );
}
