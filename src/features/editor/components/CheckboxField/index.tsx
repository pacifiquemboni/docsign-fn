import { Square } from 'lucide-react';
import type { DocumentField } from '../../types';

interface Props {
  field: DocumentField;
  selected: boolean;
}

export function CheckboxField({ field, selected }: Props) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded border-2 transition-colors select-none
        ${selected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-emerald-300 bg-emerald-50/60 hover:border-emerald-400 hover:bg-emerald-50'
        }
        ${field.locked ? 'cursor-not-allowed opacity-70' : 'cursor-move'}
      `}
    >
      <Square
        className={`h-4 w-4 ${selected ? 'text-emerald-500' : 'text-emerald-300'}`}
        strokeWidth={2}
      />
    </div>
  );
}
