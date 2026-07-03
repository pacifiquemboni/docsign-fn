import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface DeletePageDialogProps {
  pageNumber: number | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePageDialog({
  pageNumber,
  isDeleting,
  onConfirm,
  onCancel,
}: DeletePageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pageNumber !== null) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [pageNumber]);

  if (pageNumber === null) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      className="rounded-2xl border border-gray-200 p-0 shadow-2xl backdrop:bg-gray-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="w-80 p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>

        <h2 className="mb-1 text-base font-semibold text-gray-900">
          Delete page {pageNumber}?
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          This removes the page from the document. Changes are staged until you
          save.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={isDeleting}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </dialog>
  );
}
