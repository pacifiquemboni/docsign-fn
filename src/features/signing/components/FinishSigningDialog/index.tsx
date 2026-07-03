import { FileCheck2, X } from 'lucide-react';

interface FinishSigningDialogProps {
  open: boolean;
  incompleteCount: number;
  isGenerating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FinishSigningDialog({
  open,
  incompleteCount,
  isGenerating,
  onConfirm,
  onCancel,
}: FinishSigningDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Finish signing"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <FileCheck2 className="h-5 w-5 text-indigo-600" />
          </div>
          <button
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-3 text-base font-semibold text-gray-900">
          Complete signing
        </h2>

        {incompleteCount > 0 ? (
          <p className="mt-1.5 text-sm text-amber-600">
            {incompleteCount} required field{incompleteCount !== 1 ? 's are' : ' is'} still
            incomplete. You can finish, but the generated PDF may be missing required signatures.
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-gray-500">
            All required fields are complete. The signed PDF will be generated and ready for
            download.
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isGenerating}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isGenerating}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {isGenerating ? 'Generating…' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
