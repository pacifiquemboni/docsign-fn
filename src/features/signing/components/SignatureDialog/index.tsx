import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSignatures } from '../../hooks/useSignatures';
import { useCreateSignature } from '../../hooks/useCreateSignature';
import { useDeleteSignature } from '../../hooks/useDeleteSignature';
import { SignatureCanvas, type SignatureCanvasHandle } from '../SignatureCanvas';
import { UploadSignature } from '../UploadSignature';
import { TypedSignature } from '../TypedSignature';
import { SavedSignatures } from '../SavedSignatures';
import { HANDWRITING_FONTS, type HandwritingFont, type SignatureTab } from '../../types';

interface SignatureDialogProps {
  /** 'initials' reduces the label copy; 'signature' is the default. */
  mode?: 'signature' | 'initials';
  open: boolean;
  onClose: () => void;
  /** Called with the signature ID to apply to the active field. */
  onApply: (signatureId: string) => void;
}

const TABS: { id: SignatureTab; label: string }[] = [
  { id: 'draw',  label: 'Draw' },
  { id: 'upload', label: 'Upload' },
  { id: 'type',  label: 'Type' },
  { id: 'saved', label: 'Saved' },
];

export function SignatureDialog({ mode = 'signature', open, onClose, onApply }: SignatureDialogProps) {
  const [tab, setTab] = useState<SignatureTab>('draw');

  // Per-tab state — kept alive while dialog is open
  const canvasRef = useRef<SignatureCanvasHandle>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [typedText, setTypedText] = useState('');
  const [typedFont, setTypedFont] = useState<HandwritingFont>(HANDWRITING_FONTS[0]);
  const [savedSelectedId, setSavedSelectedId] = useState<string | null>(null);

  const { data: signatures = [], isLoading: sigsLoading } = useSignatures();
  const createMutation = useCreateSignature();
  const deleteMutation = useDeleteSignature();

  if (!open) return null;

  const isCreating = createMutation.isPending;

  async function handleApply() {
    if (tab === 'saved') {
      if (!savedSelectedId) return;
      onApply(savedSelectedId);
      onClose();
      return;
    }

    let input: Parameters<typeof createMutation.mutate>[0] | null = null;

    if (tab === 'draw') {
      if (!canvasRef.current || canvasRef.current.isEmpty()) return;
      const blob = await canvasRef.current.toBlob();
      if (!blob) return;
      input = { type: 'draw', blob };
    } else if (tab === 'upload') {
      if (!uploadFile) return;
      input = { type: 'upload', file: uploadFile };
    } else if (tab === 'type') {
      if (!typedText.trim()) return;
      input = { type: 'type', text: typedText.trim(), font: typedFont };
    }

    if (!input) return;

    createMutation.mutate(input, {
      onSuccess: (res) => {
        if (res.data) {
          onApply(res.data.id);
          onClose();
        }
      },
    });
  }

  const canApply =
    (tab === 'draw') ? true :  // checked async in handleApply
    (tab === 'upload') ? uploadFile !== null :
    (tab === 'type')   ? typedText.trim().length > 0 :
    (tab === 'saved')  ? savedSelectedId !== null :
    false;

  const label = mode === 'initials' ? 'initials' : 'signature';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${label}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900 capitalize">
            Add {label}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors',
                tab === t.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              )}
            >
              {t.label}
              {t.id === 'saved' && signatures.length > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                  {signatures.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[280px] p-5">
          {tab === 'draw' && (
            <SignatureCanvas ref={canvasRef} width={480} height={180} />
          )}
          {tab === 'upload' && (
            <UploadSignature file={uploadFile} onChange={setUploadFile} />
          )}
          {tab === 'type' && (
            <TypedSignature
              text={typedText}
              font={typedFont}
              onTextChange={setTypedText}
              onFontChange={setTypedFont}
            />
          )}
          {tab === 'saved' && (
            <SavedSignatures
              signatures={signatures}
              isLoading={sigsLoading}
              selectedId={savedSelectedId}
              onSelect={setSavedSelectedId}
              onDelete={(id) => {
                deleteMutation.mutate(id);
                if (savedSelectedId === id) setSavedSelectedId(null);
              }}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </div>

        {/* Error */}
        {createMutation.error && (
          <p className="px-5 pb-2 text-xs font-medium text-red-500">
            {createMutation.error.message}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply || isCreating}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {isCreating ? 'Saving…' : tab === 'saved' ? 'Apply' : 'Save & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
