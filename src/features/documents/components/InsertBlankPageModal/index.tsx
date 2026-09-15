import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { InsertBlankPageRequest, InsertPosition, PageOrientation, PageSize } from '../../types';

interface InsertBlankPageModalProps {
  open: boolean;
  targetPageNumber: number;
  totalPages: number;
  isInserting: boolean;
  onInsert: (req: InsertBlankPageRequest) => void;
  onCancel: () => void;
}

type OptionButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function OptionButton({ active, onClick, children }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700'
          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
      )}
    >
      {children}
    </button>
  );
}

export function InsertBlankPageModal({
  open,
  targetPageNumber,
  isInserting,
  onInsert,
  onCancel,
}: InsertBlankPageModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [size, setSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [position, setPosition] = useState<InsertPosition>('after');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  if (!open) return null;

  const handleInsert = () => {
    onInsert({ position, page: targetPageNumber, size, orientation });
  };

  const previewW = size === 'A4' ? 595 : 612;
  const previewH = size === 'A4' ? 842 : 792;
  const [pw, ph] =
    orientation === 'landscape' ? [previewH, previewW] : [previewW, previewH];
  const scale = 80 / Math.max(pw, ph);
  const thumbW = Math.round(pw * scale);
  const thumbH = Math.round(ph * scale);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      onCancel={onCancel}
    >
      <h2 className="mb-4 text-base font-semibold text-gray-900">Insert Blank Page</h2>

      {/* Page size preview */}
      <div className="mb-5 flex items-center justify-center">
        <div
          className="rounded border border-gray-300 bg-white shadow-sm"
          style={{ width: thumbW, height: thumbH }}
          aria-hidden
        />
      </div>

      {/* Size */}
      <div className="mb-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
          Page Size
        </p>
        <div className="flex gap-2">
          <OptionButton active={size === 'A4'} onClick={() => setSize('A4')}>
            A4
          </OptionButton>
          <OptionButton active={size === 'LETTER'} onClick={() => setSize('LETTER')}>
            Letter
          </OptionButton>
        </div>
      </div>

      {/* Orientation */}
      <div className="mb-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
          Orientation
        </p>
        <div className="flex gap-2">
          <OptionButton
            active={orientation === 'portrait'}
            onClick={() => setOrientation('portrait')}
          >
            Portrait
          </OptionButton>
          <OptionButton
            active={orientation === 'landscape'}
            onClick={() => setOrientation('landscape')}
          >
            Landscape
          </OptionButton>
        </div>
      </div>

      {/* Position */}
      <div className="mb-6">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
          Insert Position
        </p>
        <div className="flex gap-2">
          <OptionButton active={position === 'before'} onClick={() => setPosition('before')}>
            Before page {targetPageNumber}
          </OptionButton>
          <OptionButton active={position === 'after'} onClick={() => setPosition('after')}>
            After page {targetPageNumber}
          </OptionButton>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isInserting}>
          Cancel
        </Button>
        <Button size="sm" loading={isInserting} onClick={handleInsert}>
          Insert
        </Button>
      </div>
    </dialog>
  );
}
