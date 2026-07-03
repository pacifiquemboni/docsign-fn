import { memo, useCallback, useRef } from 'react';
import Moveable from 'react-moveable';
import type { DocumentField } from '../../types';
import type { ResizeFieldPayload, MoveFieldPayload } from '../../types';
import { FieldRenderer } from '../FieldRenderer';
import { pdfPointsToPixels, pixelsToPdfPoints, clampPixelRect } from '../../utils/coordinates';

interface MoveableFieldProps {
  field: DocumentField;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (fieldId: string, payload: MoveFieldPayload) => void;
  onResize: (fieldId: string, payload: ResizeFieldPayload) => void;
}

const MIN_W = 40;
const MIN_H = 20;
/** Position tolerance (px) below which we skip the extra move call after a resize. */
const POSITION_EPSILON = 0.5;

export const MoveableField = memo(function MoveableField({
  field,
  canvasWidth,
  canvasHeight,
  zoom,
  isSelected,
  onSelect,
  onMove,
  onResize,
}: MoveableFieldProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const px = pdfPointsToPixels(field, canvasHeight, zoom);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(field.id);
    },
    [field.id, onSelect],
  );

  return (
    <>
      <div
        ref={targetRef}
        role="button"
        tabIndex={0}
        aria-label={`${field.field_type} field: ${field.label}`}
        aria-selected={isSelected}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(field.id)}
        onClick={handleClick}
        style={{
          position: 'absolute',
          left:   px.left,
          top:    px.top,
          width:  px.width,
          height: px.height,
          outline: isSelected ? '2px solid #6366f1' : undefined,
          outlineOffset: 1,
          borderRadius: 4,
          zIndex: isSelected ? 10 : 1,
        }}
      >
        <FieldRenderer field={field} selected={isSelected} />
      </div>

      {isSelected && !field.locked && (
        <Moveable
          target={targetRef}
          draggable
          resizable
          origin={false}
          renderDirections={['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']}
          snappable
          bounds={{ left: 0, top: 0, right: canvasWidth, bottom: canvasHeight }}
          onDrag={({ target, left, top }) => {
            target.style.left = `${left}px`;
            target.style.top  = `${top}px`;
          }}
          onDragEnd={({ target, lastEvent }) => {
            if (!lastEvent) return;
            const clamped = clampPixelRect(
              { left: lastEvent.left, top: lastEvent.top, width: px.width, height: px.height },
              canvasWidth,
              canvasHeight,
            );
            // Reset inline styles so React takes over after state update
            target.style.left = '';
            target.style.top  = '';
            const pt = pixelsToPdfPoints(clamped, canvasHeight, zoom);
            onMove(field.id, { x: pt.x, y: pt.y });
          }}
          onResize={({ target, width, height, drag }) => {
            target.style.width  = `${Math.max(MIN_W, width)}px`;
            target.style.height = `${Math.max(MIN_H, height)}px`;
            target.style.left   = `${drag.left}px`;
            target.style.top    = `${drag.top}px`;
          }}
          onResizeEnd={({ target, lastEvent }) => {
            if (!lastEvent) return;
            const clamped = clampPixelRect(
              {
                left:   lastEvent.drag.left,
                top:    lastEvent.drag.top,
                width:  Math.max(MIN_W, lastEvent.width),
                height: Math.max(MIN_H, lastEvent.height),
              },
              canvasWidth,
              canvasHeight,
            );
            target.style.left   = '';
            target.style.top    = '';
            target.style.width  = '';
            target.style.height = '';

            const pt = pixelsToPdfPoints(clamped, canvasHeight, zoom);
            onResize(field.id, { width: pt.width, height: pt.height });

            // The resize endpoint can't reposition — if the drag handle moved the
            // top/left origin (e.g. nw/n/w handles), issue a separate move call.
            const movedX = Math.abs(clamped.left - px.left) > POSITION_EPSILON;
            const movedY = Math.abs(clamped.top - px.top) > POSITION_EPSILON;
            if (movedX || movedY) {
              onMove(field.id, { x: pt.x, y: pt.y });
            }
          }}
        />
      )}
    </>
  );
});
