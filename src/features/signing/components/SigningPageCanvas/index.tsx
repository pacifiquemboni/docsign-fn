import { memo, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentField } from '@/features/editor/types';
import type { FieldCompletions } from '../../types';
import { SigningOverlay } from '../SigningOverlay';

interface SigningPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pdfPageIndex: number;
  stagedRotation: number;
  zoom: number;
  pageNumber: number;
  fields: DocumentField[];
  completions: FieldCompletions;
  activeTextField: string | null;
  highlightedFieldId: string | null;
  onFieldClick: (field: DocumentField) => void;
  onTextCommit: (fieldId: string, value: string) => void;
}

export const SigningPageCanvas = memo(function SigningPageCanvas({
  pdfDoc,
  pdfPageIndex,
  stagedRotation,
  zoom,
  pageNumber,
  fields,
  completions,
  activeTextField,
  highlightedFieldId,
  onFieldClick,
  onTextCommit,
}: SigningPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      setRendering(true);
      try {
        const page = await pdfDoc.getPage(pdfPageIndex);
        if (cancelled) return;
        const intrinsic = page.rotate;
        const extra = ((stagedRotation - intrinsic) % 360 + 360) % 360;
        const viewport = page.getViewport({ scale: zoom, rotation: extra });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setCanvasSize({ width: viewport.width, height: viewport.height });
      } catch {
        // ignore
      } finally {
        if (!cancelled) setRendering(false);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [pdfDoc, pdfPageIndex, stagedRotation, zoom]);

  // Scroll highlighted field into view
  useEffect(() => {
    if (!highlightedFieldId || !containerRef.current) return;
    const highlighted = fields.find((f) => f.id === highlightedFieldId);
    if (!highlighted) return;
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedFieldId, fields]);

  return (
    <div ref={containerRef} className="relative mx-auto" style={{ width: canvasSize.width || undefined }}>
      <div className="absolute -top-5 left-0 text-xs text-gray-400">Page {pageNumber}</div>

      <canvas
        ref={canvasRef}
        aria-label={`Page ${pageNumber}`}
        className={`block rounded shadow-md shadow-gray-200 ${rendering ? 'opacity-0' : 'opacity-100'}`}
      />

      {rendering && (
        <div className="skeleton absolute inset-0 rounded" style={{ minHeight: 200 }} aria-hidden />
      )}

      {canvasSize.width > 0 && (
        <SigningOverlay
          fields={fields}
          completions={completions}
          canvasHeight={canvasSize.height}
          zoom={zoom}
          activeTextField={activeTextField}
          onFieldClick={onFieldClick}
          onTextCommit={onTextCommit}
        />
      )}
    </div>
  );
});
