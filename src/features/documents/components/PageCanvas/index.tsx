import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PageCanvasProps {
  pdfDocument: PDFDocumentProxy;
  /** 1-based physical page index in the PDF file */
  pdfPageIndex: number;
  /** Rotation from DB — additional degrees on top of the PDF's own rotation */
  stagedRotation: number;
  zoom: number;
  isSelected: boolean;
  pageNumber: number;
  onSelect: (pageNumber: number) => void;
}

export function PageCanvas({
  pdfDocument,
  pdfPageIndex,
  stagedRotation,
  zoom,
  isSelected,
  pageNumber,
  onSelect,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    async function render() {
      setError(false);
      setRendering(true);
      try {
        const page = await pdfDocument.getPage(pdfPageIndex);
        if (cancelled) return;

        // pdfjs applies the PDF's own rotation automatically.
        // We calculate the extra rotation needed so the total matches stagedRotation.
        const intrinsic = page.rotate;
        const extra = ((stagedRotation - intrinsic) % 360 + 360) % 360;
        const viewport = page.getViewport({ scale: zoom, rotation: extra });

        const ctx = canvas!.getContext('2d');
        if (!ctx || cancelled) return;

        canvas!.width = viewport.width;
        canvas!.height = viewport.height;

        const task = page.render({ canvasContext: ctx, viewport });
        await task.promise;
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'RenderingCancelledException') {
          setError(true);
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [pdfDocument, pdfPageIndex, stagedRotation, zoom]);

  return (
    <div
      className="relative mx-auto cursor-pointer"
      onClick={() => onSelect(pageNumber)}
      style={{
        outline: isSelected ? '2px solid #6366f1' : undefined,
        outlineOffset: 4,
        borderRadius: 4,
      }}
    >
      {rendering && (
        <div
          className="skeleton absolute inset-0 rounded"
          aria-label="Rendering page…"
        />
      )}
      {error ? (
        <div className="flex h-40 w-full items-center justify-center rounded bg-gray-50 text-sm text-gray-400">
          Failed to render page {pageNumber}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          aria-label={`Page ${pageNumber}`}
          className="block rounded shadow-md"
          style={{ maxWidth: '100%', display: rendering ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}
