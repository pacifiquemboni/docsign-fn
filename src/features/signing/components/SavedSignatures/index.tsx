import { Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getSignatureImageUrl } from '../../api/signingApi';
import type { SignatureRecord } from '../../types';

interface SavedSignaturesProps {
  signatures: SignatureRecord[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function SavedSignatures({
  signatures,
  isLoading,
  selectedId,
  onSelect,
  onDelete,
  isDeleting,
}: SavedSignaturesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (signatures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-gray-400">
        <p className="font-medium">No saved signatures yet</p>
        <p className="text-xs">Draw, upload, or type a signature to save it.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {signatures.map((sig) => (
        <div
          key={sig.id}
          className={cn(
            'group relative cursor-pointer rounded-xl border-2 p-2 transition-all',
            selectedId === sig.id
              ? 'border-indigo-400 bg-indigo-50 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-white',
          )}
          onClick={() => onSelect(sig.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(sig.id)}
          aria-pressed={selectedId === sig.id}
          aria-label={`Signature ${sig.signature_type.toLowerCase()}${sig.signature_text ? `: ${sig.signature_text}` : ''}`}
        >
          <img
            src={getSignatureImageUrl(sig.id)}
            alt={`${sig.signature_type} signature`}
            className="h-14 w-full object-contain"
            draggable={false}
          />

          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 capitalize">
              {sig.signature_type.toLowerCase()}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(sig.id); }}
              disabled={isDeleting}
              className="h-5 w-5 flex items-center justify-center rounded text-gray-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 disabled:opacity-30"
              aria-label="Delete signature"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
