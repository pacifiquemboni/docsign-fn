import { useCallback } from 'react';
import type { DocumentField, FieldType, MoveFieldPayload, ResizeFieldPayload } from '../../types';
import { DRAG_TYPE_KEY } from '../../types';
import { buildDefaultRect } from '../../utils/fieldDefaults';
import { MoveableField } from '../MoveableField';
import { FloatingToolbar } from '../FloatingToolbar';

interface OverlayLayerProps {
  fields: DocumentField[];
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  selectedFieldId: string | null;
  isDuplicating: boolean;
  isDeleting: boolean;
  isLocking: boolean;
  onSelect: (id: string | null) => void;
  onDropCreate: (type: FieldType, x: number, y: number, width: number, height: number) => void;
  onMove: (fieldId: string, payload: MoveFieldPayload) => void;
  onResize: (fieldId: string, payload: ResizeFieldPayload) => void;
  onDuplicate: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
  onToggleLock: (fieldId: string) => void;
}

export function OverlayLayer({
  fields,
  canvasWidth,
  canvasHeight,
  zoom,
  selectedFieldId,
  isDuplicating,
  isDeleting,
  isLocking,
  onSelect,
  onDropCreate,
  onMove,
  onResize,
  onDuplicate,
  onDelete,
  onToggleLock,
}: OverlayLayerProps) {
  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes(DRAG_TYPE_KEY)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData(DRAG_TYPE_KEY) as FieldType;
      if (!type) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const cxPx = e.clientX - rect.left;
      const cyPx = e.clientY - rect.top;
      const pt = buildDefaultRect(type, cxPx, cyPx, canvasWidth, canvasHeight, zoom);
      onDropCreate(type, pt.x, pt.y, pt.width, pt.height);
    },
    [onDropCreate, canvasWidth, canvasHeight, zoom],
  );

  const handleBackgroundClick = useCallback(() => onSelect(null), [onSelect]);

  return (
    <div
      className="pointer-events-auto absolute inset-0"
      style={{ zIndex: 5 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleBackgroundClick}
    >
      {fields.map((field) => (
        <MoveableField
          key={field.id}
          field={field}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          zoom={zoom}
          isSelected={field.id === selectedFieldId}
          onSelect={onSelect}
          onMove={onMove}
          onResize={onResize}
        />
      ))}

      {selectedField && canvasWidth > 0 && (
        <FloatingToolbar
          field={selectedField}
          canvasHeight={canvasHeight}
          zoom={zoom}
          isDuplicating={isDuplicating}
          isDeleting={isDeleting}
          isLocking={isLocking}
          onDuplicate={() => onDuplicate(selectedField.id)}
          onDelete={() => onDelete(selectedField.id)}
          onToggleLock={() => onToggleLock(selectedField.id)}
        />
      )}
    </div>
  );
}
