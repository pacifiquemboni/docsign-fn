import { Calendar, Pen, PenLine, Square, Type } from 'lucide-react';
import type { FieldType } from '../../types';
import { DRAG_TYPE_KEY, FIELD_PALETTE_ITEMS } from '../../types';

interface FieldPaletteProps {
  fieldCount: number;
  /** Render without the outer aside/border/width — used when embedded in a tabbed panel. */
  bare?: boolean;
}

const ICONS: Record<FieldType, React.ReactNode> = {
  SIGNATURE: <PenLine className="h-4 w-4" />,
  INITIAL:   <Pen    className="h-4 w-4" />,
  TEXT:      <Type   className="h-4 w-4" />,
  DATE:      <Calendar className="h-4 w-4" />,
  CHECKBOX:  <Square className="h-4 w-4" />,
};

const ACCENT: Record<FieldType, string> = {
  SIGNATURE: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  INITIAL:   'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
  TEXT:      'border-sky-200   bg-sky-50   text-sky-700   hover:bg-sky-100',
  DATE:      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  CHECKBOX:  'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
};

export function FieldPalette({ fieldCount, bare = false }: FieldPaletteProps) {
  function handleDragStart(e: React.DragEvent, type: FieldType) {
    e.dataTransfer.setData(DRAG_TYPE_KEY, type);
    e.dataTransfer.effectAllowed = 'copy';
  }

  const Container = bare ? 'div' : 'aside';

  return (
    <Container
      className={
        bare
          ? 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4'
          : 'flex w-56 shrink-0 flex-col gap-3 overflow-y-auto border-r border-gray-200 bg-white p-4'
      }
    >
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Fields
        </h2>
        <p className="mt-0.5 text-[11px] text-gray-400">
          Drag onto the page to place
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {FIELD_PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            className={`flex cursor-grab items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors active:cursor-grabbing ${ACCENT[item.type]}`}
            aria-label={`Drag to add ${item.label} field`}
            title={item.description}
          >
            {ICONS[item.type]}
            <div className="min-w-0">
              <div className="font-medium">{item.label}</div>
              <div className="text-[11px] opacity-70">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-gray-100 pt-3">
        <p className="text-[11px] text-gray-400">
          {fieldCount === 0
            ? 'No fields placed yet'
            : `${fieldCount} field${fieldCount !== 1 ? 's' : ''} placed`}
        </p>
      </div>
    </Container>
  );
}
