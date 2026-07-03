import { useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentPage, ZoomLevel } from '@/features/documents/types';
import type { DocumentField } from '@/features/editor/types';
import type { FieldCompletions } from '../../types';
import { SigningPageCanvas } from '../SigningPageCanvas';
import { documentApi } from '@/features/documents/api/documentApi';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface SigningViewerProps {
  documentId: string;
  pages: DocumentPage[];
  fields: DocumentField[];
  completions: FieldCompletions;
  zoom: ZoomLevel;
  activeTextField: string | null;
  highlightedFieldId: string | null;
  onFieldClick: (field: DocumentField) => void;
  onTextCommit: (fieldId: string, value: string) => void;
}

export function SigningViewer({
  documentId,
  pages,
  fields,
  completions,
  zoom,
  activeTextField,
  highlightedFieldId,
  onFieldClick,
  onTextCommit,
}: SigningViewerProps) {
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
    return () => { cancelled = true; task?.destroy(); };
  }, [documentId]);

  if (loading) return (
    <div className="flex flex-1 items-center justify-center"><PageSpinner /></div>
  );

  if (loadError || !pdfDoc) return (
    <div className="flex flex-1 items-center justify-center">
      <ErrorState title="Could not load PDF" message={loadError ?? 'Unknown error'} />
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-8 scrollbar-thin">
      {pages.map((page) => {
        const pageFields = fields.filter((f) => f.page_number === page.page_number);
        return (
          <SigningPageCanvas
            key={page.id}
            pdfDoc={pdfDoc}
            pdfPageIndex={page.original_page_index !== null ? page.original_page_index + 1 : page.page_number}
            stagedRotation={page.rotation}
            zoom={zoom}
            pageNumber={page.page_number}
            fields={pageFields}
            completions={completions}
            activeTextField={activeTextField}
            highlightedFieldId={highlightedFieldId}
            onFieldClick={onFieldClick}
            onTextCommit={onTextCommit}
          />
        );
      })}
    </div>
  );
}
