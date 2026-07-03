import { Pen } from 'lucide-react';
import type { DocumentField } from '../../types';

interface Props {
  field: DocumentField;
  selected: boolean;
}

export function InitialField({ field, selected }: Props) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center gap-1.5 rounded border-2 border-dashed text-xs font-medium transition-colors select-none
        ${selected
          ? 'border-violet-500 bg-violet-50 text-violet-600'
          : 'border-violet-300 bg-violet-50/60 text-violet-400 hover:border-violet-400 hover:bg-violet-50'
        }
        ${field.locked ? 'cursor-not-allowed opacity-70' : 'cursor-move'}
      `}
    >
      <Pen className="h-3 w-3 shrink-0" strokeWidth={2} />
      <span className="truncate">{field.label || 'Initials'}</span>
      {field.required && <span className="text-red-500">*</span>}
    </div>
  );
}
