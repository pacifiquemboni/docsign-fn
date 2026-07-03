import { useEffect, useRef, useState, memo } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentField, FieldType, MoveFieldPayload, ResizeFieldPayload } from '../../types';
import { OverlayLayer } from '../OverlayLayer';

interface PageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  /** 1-based PDF page number */
  pdfPageIndex: number;
  /** Staged rotation in degrees (0 / 90 / 180 / 270) */
  stagedRotation: number;
  zoom: number;
  pageNumber: number;
  fields: DocumentField[];
  selectedFieldId: string | null;
  isDuplicating: boolean;
  isDeleting: boolean;
  isLocking: boolean;
  isSelected: boolean;
  onSelectPage: (n: number) => void;
  onSelectField: (id: string | null) => void;
  onDropCreate: (type: FieldType, x: number, y: number, width: number, height: number) => void;
  onMove: (fieldId: string, payload: MoveFieldPayload) => void;
  onResize: (fieldId: string, payload: ResizeFieldPayload) => void;
  onDuplicate: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
  onToggleLock: (fieldId: string) => void;
}

export const PageCanvas = memo(function PageCanvas({
  pdfDoc,
  pdfPageIndex,
  stagedRotation,
  zoom,
  pageNumber,
  fields,
  selectedFieldId,
  isDuplicating,
  isDeleting,
  isLocking,
  isSelected,
  onSelectPage,
  onSelectField,
  onDropCreate,
  onMove,
  onResize,
  onDuplicate,
  onDelete,
  onToggleLock,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let renderTask: ReturnType<ReturnType<PDFDocumentProxy['getPage']>['then']> | null = null;

    async function render() {
      setRendering(true);
      try {
        const page = await pdfDoc.getPage(pdfPageIndex);
        if (cancelled) return;

        const intrinsic = page.rotate;
        const extra = ((stagedRotation - intrinsic) % 360 + 360) % 360;
        const viewport = page.getViewport({ scale: zoom, rotation: extra });

        const ctx = canvas!.getContext('2d');
        if (!ctx || cancelled) return;

        canvas!.width  = viewport.width;
        canvas!.height = viewport.height;

        const task = page.render({ canvasContext: ctx, viewport });
        renderTask = task.promise as unknown as typeof renderTask;
        await task.promise;

        if (!cancelled) {
          setCanvasSize({ width: viewport.width, height: viewport.height });
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'RenderingCancelledException') return;
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pdfPageIndex, stagedRotation, zoom]);

  return (
    <div
      className="group relative mx-auto"
      style={{ width: canvasSize.width || undefined }}
      onClick={() => onSelectPage(pageNumber)}
    >
      {/* Page number label */}
      <div className="absolute -top-5 left-0 text-xs text-gray-400">
        Page {pageNumber}
      </div>

      {/* PDF canvas */}
      <canvas
        ref={canvasRef}
        aria-label={`Page ${pageNumber}`}
        className={`block rounded shadow-md transition-shadow ${
          isSelected ? 'shadow-indigo-200 ring-1 ring-indigo-300' : 'shadow-gray-200'
        } ${rendering ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Skeleton shown while rendering */}
      {rendering && (
        <div
          className="skeleton absolute inset-0 rounded"
          style={{ minHeight: 200 }}
          aria-hidden
        />
      )}

      {/* Field overlay — absolutely covers the canvas */}
      {canvasSize.width > 0 && (
        <OverlayLayer
          fields={fields}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          zoom={zoom}
          selectedFieldId={selectedFieldId}
          isDuplicating={isDuplicating}
          isDeleting={isDeleting}
          isLocking={isLocking}
          onSelect={onSelectField}
          onDropCreate={onDropCreate}
          onMove={onMove}
          onResize={onResize}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onToggleLock={onToggleLock}
        />
      )}
    </div>
  );
});
