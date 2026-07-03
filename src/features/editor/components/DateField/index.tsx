import { Calendar } from 'lucide-react';
import type { DocumentField } from '../../types';

interface Props {
  field: DocumentField;
  selected: boolean;
}

export function DateField({ field, selected }: Props) {
  return (
    <div
      className={`flex h-full w-full items-center gap-1.5 rounded border px-2 text-xs transition-colors select-none
        ${selected
          ? 'border-amber-500 bg-amber-50 text-amber-700'
          : 'border-amber-300 bg-amber-50/60 text-amber-400 hover:border-amber-400 hover:bg-amber-50'
        }
        ${field.locked ? 'cursor-not-allowed opacity-70' : 'cursor-move'}
      `}
    >
      <Calendar className="h-3 w-3 shrink-0" strokeWidth={2} />
      <span className="truncate">{field.placeholder || field.label || 'Date'}</span>
      {field.required && <span className="ml-auto text-red-500">*</span>}
    </div>
  );
}
