import { Type } from 'lucide-react';
import type { DocumentField } from '../../types';

interface Props {
  field: DocumentField;
  selected: boolean;
}

export function TextField({ field, selected }: Props) {
  return (
    <div
      className={`flex h-full w-full items-center gap-1.5 rounded border px-2 text-xs transition-colors select-none
        ${selected
          ? 'border-sky-500 bg-sky-50 text-sky-700'
          : 'border-sky-300 bg-sky-50/60 text-sky-400 hover:border-sky-400 hover:bg-sky-50'
        }
        ${field.locked ? 'cursor-not-allowed opacity-70' : 'cursor-move'}
      `}
    >
      <Type className="h-3 w-3 shrink-0" strokeWidth={2} />
      <span className="truncate">{field.placeholder || field.label || 'Text'}</span>
      {field.required && <span className="ml-auto text-red-500">*</span>}
    </div>
  );
}
