import { Copy, Lock, Trash2, Unlock } from 'lucide-react';
import type { DocumentField } from '../../types';
import { pdfPointsToPixels } from '../../utils/coordinates';

interface FloatingToolbarProps {
  field: DocumentField;
  canvasHeight: number;
  zoom: number;
  isDuplicating: boolean;
  isDeleting: boolean;
  isLocking: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
}

const TOOLBAR_HEIGHT = 32;
const TOOLBAR_OFFSET = 6;

export function FloatingToolbar({
  field,
  canvasHeight,
  zoom,
  isDuplicating,
  isDeleting,
  isLocking,
  onDuplicate,
  onDelete,
  onToggleLock,
}: FloatingToolbarProps) {
  const px = pdfPointsToPixels(field, canvasHeight, zoom);

  // Place toolbar above the field; if no room, place below
  const top =
    px.top >= TOOLBAR_HEIGHT + TOOLBAR_OFFSET
      ? px.top - TOOLBAR_HEIGHT - TOOLBAR_OFFSET
      : px.top + px.height + TOOLBAR_OFFSET;

  return (
    <div
      className="pointer-events-auto absolute z-20 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-1 py-1 shadow-lg"
      style={{ left: px.left, top, minWidth: 120 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <ToolbarBtn
        label="Duplicate"
        disabled={isDuplicating}
        onClick={onDuplicate}
      >
        <Copy className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <ToolbarBtn
        label={field.locked ? 'Unlock' : 'Lock'}
        disabled={isLocking}
        onClick={onToggleLock}
      >
        {field.locked ? (
          <Unlock className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <Lock className="h-3.5 w-3.5" />
        )}
      </ToolbarBtn>

      <div className="mx-0.5 h-4 w-px bg-gray-200" />

      <ToolbarBtn
        label="Delete"
        disabled={isDeleting}
        onClick={onDelete}
        danger
      >
        <Trash2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({
  label,
  disabled,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-40
        ${danger
          ? 'text-gray-500 hover:bg-red-50 hover:text-red-500'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      {children}
    </button>
  );
}
