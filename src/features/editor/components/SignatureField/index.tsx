import { PenLine } from 'lucide-react';
import type { DocumentField } from '../../types';

interface Props {
  field: DocumentField;
  selected: boolean;
}

export function SignatureField({ field, selected }: Props) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center gap-1.5 rounded border-2 border-dashed text-xs font-medium transition-colors select-none
        ${selected
          ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
          : 'border-indigo-300 bg-indigo-50/60 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50'
        }
        ${field.locked ? 'cursor-not-allowed opacity-70' : 'cursor-move'}
      `}
    >
      <PenLine className="h-3 w-3 shrink-0" strokeWidth={2} />
      <span className="truncate">{field.label || 'Signature'}</span>
      {field.required && <span className="text-red-500">*</span>}
    </div>
  );
}
