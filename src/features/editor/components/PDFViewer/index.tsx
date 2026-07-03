import { useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentPage, ZoomLevel } from '@/features/documents/types';
import type { DocumentField, FieldType, MoveFieldPayload, ResizeFieldPayload } from '../../types';
import { PageCanvas } from '../PageCanvas';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { documentApi } from '@/features/documents/api/documentApi';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  documentId: string;
  pages: DocumentPage[];
  fields: DocumentField[];
  zoom: ZoomLevel;
  /** Increment to force PDF reload after save */
  pdfVersion: number;
  selectedPageNumber: number;
  selectedFieldId: string | null;
  isDuplicating: boolean;
  isDeleting: boolean;
  isLocking: boolean;
  onSelectPage: (n: number) => void;
  onSelectField: (id: string | null) => void;
  onDropCreate: (type: FieldType, page: number, x: number, y: number, width: number, height: number) => void;
  onMove: (fieldId: string, payload: MoveFieldPayload) => void;
  onResize: (fieldId: string, payload: ResizeFieldPayload) => void;
  onDuplicate: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
  onToggleLock: (fieldId: string) => void;
}

export function PDFViewer({
  documentId,
  pages,
  fields,
  zoom,
  pdfVersion,
  selectedPageNumber,
  selectedFieldId,
  isDuplicating,
  isDeleting,
  isLocking,
  onSelectPage,
  onSelectField,
  onDropCreate,
  onMove,
  onResize,
  onDuplicate,
  onDelete,
  onToggleLock,
}: PDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof pdfjs.getDocument> | null = null;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const blob = await documentApi.download(documentId);
        if (cancelled) return;
        const buffer = await blob.arrayBuffer();
        if (cancelled) return;
        task = pdfjs.getDocument({ data: buffer });
        const doc = await task.promise;
        if (!cancelled) {
          setPdfDoc((prev) => { prev?.destroy(); return doc; });
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      task?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, pdfVersion]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (loadError || !pdfDoc) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ErrorState title="Could not load PDF" message={loadError ?? 'Unknown error'} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-8 scrollbar-thin">
      {pages.map((page) => {
        const pageFields = fields.filter((f) => f.page_number === page.page_number);

        return (
          <PageCanvas
            key={page.id}
            pdfDoc={pdfDoc}
            pdfPageIndex={page.original_page_index !== null ? page.original_page_index + 1 : page.page_number}
            stagedRotation={page.rotation}
            zoom={zoom}
            pageNumber={page.page_number}
            fields={pageFields}
            selectedFieldId={selectedFieldId}
            isDuplicating={isDuplicating}
            isDeleting={isDeleting}
            isLocking={isLocking}
            isSelected={page.page_number === selectedPageNumber}
            onSelectPage={onSelectPage}
            onSelectField={onSelectField}
            onDropCreate={(type, x, y, width, height) =>
              onDropCreate(type, page.page_number, x, y, width, height)
            }
            onMove={onMove}
            onResize={onResize}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onToggleLock={onToggleLock}
          />
        );
      })}
    </div>
  );
}
