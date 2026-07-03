import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PageCanvas } from '../PageCanvas';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import type { DocumentPage, ZoomLevel } from '../../types';
import { documentApi } from '../../api/documentApi';
import { getThumbnailUrl } from '../../utils/thumbnailUrl';

// Renders a staged page (BLANK / DUPLICATE / IMPORTED) that hasn't been saved
// to the PDF yet, so it can't be loaded via PDF.js.
function StagedPagePreview({
  page,
  zoom,
  isSelected,
  onSelect,
}: {
  page: DocumentPage;
  zoom: ZoomLevel;
  isSelected: boolean;
  onSelect: (pageNumber: number) => void;
}) {
  const thumbUrl = getThumbnailUrl(page.thumbnail_path);
  const w = Math.round(page.page_width * zoom);
  const h = Math.round(page.page_height * zoom);

  return (
    <div
      className="relative mx-auto cursor-pointer overflow-hidden rounded bg-white shadow-md"
      style={{
        width: w,
        height: h,
        outline: isSelected ? '2px solid #6366f1' : undefined,
        outlineOffset: 4,
        borderRadius: 4,
      }}
      onClick={() => onSelect(page.page_number)}
      role="button"
      tabIndex={0}
      aria-label={`Page ${page.page_number}`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(page.page_number)}
    >
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`Page ${page.page_number}`}
          className="h-full w-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
          Page {page.page_number}
        </div>
      )}
    </div>
  );
}

// Configure pdfjs worker once at module level
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface DocumentViewerProps {
  documentId: string;
  pages: DocumentPage[];
  selectedPageNumber: number;
  zoom: ZoomLevel;
  /** Increment to force PDF reload after a save */
  pdfVersion: number;
  onPageSelect: (pageNumber: number) => void;
}

export function DocumentViewer({
  documentId,
  pages,
  selectedPageNumber,
  zoom,
  pdfVersion,
  onPageSelect,
}: DocumentViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load or reload the PDF whenever documentId or pdfVersion changes
  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const blob = await documentApi.download(documentId);
        if (cancelled) return;
        const buffer = await blob.arrayBuffer();
        if (cancelled) return;
        loadingTask = pdfjs.getDocument({ data: buffer });
        const doc = await loadingTask.promise;
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
      loadingTask?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, pdfVersion]);

  // Scroll the selected page into view
  useEffect(() => {
    const el = pageRefs.current.get(selectedPageNumber);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedPageNumber]);

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
        <ErrorState
          title="Could not load PDF"
          message={loadError ?? 'Unknown error'}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-6 scrollbar-thin"
      aria-label="Document pages"
    >
      {pages.map((page) => (
        <div
          key={page.id}
          ref={(el) => {
            if (el) pageRefs.current.set(page.page_number, el);
            else pageRefs.current.delete(page.page_number);
          }}
        >
          {page.original_page_index !== null ? (
            <PageCanvas
              pdfDocument={pdfDoc}
              pdfPageIndex={page.original_page_index + 1}
              stagedRotation={page.rotation}
              zoom={zoom}
              isSelected={page.page_number === selectedPageNumber}
              pageNumber={page.page_number}
              onSelect={onPageSelect}
            />
          ) : (
            <StagedPagePreview
              page={page}
              zoom={zoom}
              isSelected={page.page_number === selectedPageNumber}
              onSelect={onPageSelect}
            />
          )}
        </div>
      ))}
    </div>
  );
}
