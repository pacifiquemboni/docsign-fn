import { useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { useDocument } from '../hooks/useDocument';
import { useDocumentPages } from '../hooks/useDocumentPages';
import { useRotatePage } from '../hooks/useRotatePage';
import { useDeletePage } from '../hooks/useDeletePage';
import { useReorderPages } from '../hooks/useReorderPages';
import { useSaveDocument } from '../hooks/useSaveDocument';
import { useDownloadDocument } from '../hooks/useDownloadDocument';
import { useDuplicatePage } from '../hooks/useDuplicatePage';
import { useInsertBlankPage } from '../hooks/useInsertBlankPage';
import { useInsertFromSource } from '../hooks/useInsertFromSource';
import { useUploadSourceDocument } from '../hooks/useUploadSourceDocument';
import { DocumentHeader } from '../components/DocumentHeader';
import { ThumbnailSidebar } from '../components/ThumbnailSidebar';
import { Toolbar } from '../components/Toolbar';
import { DocumentViewer } from '../components/DocumentViewer';
import { DeletePageDialog } from '../components/DeletePageDialog';
import { InsertBlankPageModal } from '../components/InsertBlankPageModal';
import { InsertPdfModal } from '../components/InsertPdfModal';
import type { InsertBlankPageRequest, InsertFromSourceRequest, ZoomLevel } from '../types';

export function DocumentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();

  // UI state
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [zoom, setZoom] = useState<ZoomLevel>(1.0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [pdfVersion, setPdfVersion] = useState(0);
  const [showInsertBlank, setShowInsertBlank] = useState(false);
  const [showInsertPdf, setShowInsertPdf] = useState(false);

  if (!id) return <Navigate to="/documents" replace />;

  // Data
  const { data: docRes, isLoading: docLoading, error: docError } = useDocument(id);
  const { data: pagesRes, isLoading: pagesLoading } = useDocumentPages(id);

  // Mutations
  const rotateMutation = useRotatePage(id);
  const deleteMutation = useDeletePage(id);
  const reorderMutation = useReorderPages(id);
  const saveMutation = useSaveDocument(id);
  const downloadMutation = useDownloadDocument();
  const duplicateMutation = useDuplicatePage(id);
  const insertBlankMutation = useInsertBlankPage(id);
  const insertFromSourceMutation = useInsertFromSource(id);
  const uploadSource = useUploadSourceDocument(id);

  const document = docRes?.data;
  const pages = pagesRes?.data ?? [];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRotate = useCallback(() => {
    rotateMutation.mutate(
      { pageNumber: selectedPageNumber, degrees: 90 },
      { onError: (err) => showError(err.message) },
    );
  }, [selectedPageNumber, rotateMutation, showError]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget === null) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (selectedPageNumber === deleteTarget && selectedPageNumber > 1) {
          setSelectedPageNumber((p) => p - 1);
        }
        showSuccess('Page deleted');
      },
      onError: (err) => {
        setDeleteTarget(null);
        showError(err.message);
      },
    });
  }, [deleteTarget, deleteMutation, selectedPageNumber, showSuccess, showError]);

  const handleReorder = useCallback(
    (newPageNumbers: number[]) => {
      reorderMutation.mutate(newPageNumbers, {
        onError: (err) => showError(err.message),
      });
    },
    [reorderMutation, showError],
  );

  const handleSave = useCallback(() => {
    saveMutation.mutate(undefined, {
      onSuccess: () => {
        setPdfVersion((v) => v + 1);
        showSuccess('Document saved successfully');
      },
      onError: (err) => showError(err.message),
    });
  }, [saveMutation, showSuccess, showError]);

  const handleDownload = useCallback(() => {
    if (!document) return;
    void downloadMutation.download(id, document.original_name);
  }, [id, document, downloadMutation]);

  const handleDuplicate = useCallback(
    (pageNumber: number) => {
      duplicateMutation.mutate(pageNumber, {
        onSuccess: (res) => {
          // Select the new duplicate (inserted right after the original)
          const newPage = res.data?.find((p) => p.page_number === pageNumber + 1);
          if (newPage) setSelectedPageNumber(newPage.page_number);
          showSuccess('Page duplicated');
        },
        onError: (err) => showError(err.message),
      });
    },
    [duplicateMutation, showSuccess, showError],
  );

  const handleInsertBlank = useCallback(
    (req: InsertBlankPageRequest) => {
      insertBlankMutation.mutate(req, {
        onSuccess: (res) => {
          setShowInsertBlank(false);
          const insertAt = req.position === 'after' ? req.page + 1 : req.page;
          const newPage = res.data?.find((p) => p.page_number === insertAt);
          if (newPage) setSelectedPageNumber(newPage.page_number);
          showSuccess('Blank page inserted');
        },
        onError: (err) => {
          setShowInsertBlank(false);
          showError(err.message);
        },
      });
    },
    [insertBlankMutation, showSuccess, showError],
  );

  const handleInsertFromSource = useCallback(
    (req: InsertFromSourceRequest) => {
      insertFromSourceMutation.mutate(req, {
        onSuccess: (res) => {
          setShowInsertPdf(false);
          const insertAt = req.position === 'after' ? req.target_page + 1 : req.target_page;
          const newPage = res.data?.find((p) => p.page_number === insertAt);
          if (newPage) setSelectedPageNumber(newPage.page_number);
          showSuccess(`${req.pages.length} page${req.pages.length > 1 ? 's' : ''} inserted`);
        },
        onError: (err) => {
          setShowInsertPdf(false);
          showError(err.message);
        },
      });
    },
    [insertFromSourceMutation, showSuccess, showError],
  );

  // ── Loading / error ──────────────────────────────────────────────────────────

  if (docLoading || pagesLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (docError || !document) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ErrorState
          title="Document not found"
          message="This document may have been deleted or you don't have access."
        />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Header */}
      <DocumentHeader
        document={document}
        isSaving={saveMutation.isPending}
        isDownloading={downloadMutation.downloading}
        onSave={handleSave}
        onDownload={handleDownload}
      />

      {/* Body: sidebar + toolbar + viewer */}
      <div className="flex min-h-0 flex-1">
        <ThumbnailSidebar
          pages={pages}
          selectedPageNumber={selectedPageNumber}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          onSelectPage={setSelectedPageNumber}
          onReorder={handleReorder}
          onRotate={(pn) =>
            rotateMutation.mutate(
              { pageNumber: pn, degrees: 90 },
              { onError: (e) => showError(e.message) },
            )
          }
          onDelete={setDeleteTarget}
          onDuplicate={handleDuplicate}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Toolbar
            selectedPageNumber={selectedPageNumber}
            totalPages={pages.length}
            zoom={zoom}
            isRotating={rotateMutation.isPending}
            isDeleting={deleteMutation.isPending}
            isDuplicating={duplicateMutation.isPending}
            onRotate={handleRotate}
            onDelete={() => setDeleteTarget(selectedPageNumber)}
            onDuplicate={() => handleDuplicate(selectedPageNumber)}
            onInsertBlank={() => setShowInsertBlank(true)}
            onInsertPdf={() => setShowInsertPdf(true)}
            onZoomChange={setZoom}
          />

          <DocumentViewer
            documentId={id}
            pages={pages}
            selectedPageNumber={selectedPageNumber}
            zoom={zoom}
            pdfVersion={pdfVersion}
            onPageSelect={setSelectedPageNumber}
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <DeletePageDialog
        pageNumber={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Insert blank page */}
      <InsertBlankPageModal
        open={showInsertBlank}
        targetPageNumber={selectedPageNumber}
        totalPages={pages.length}
        isInserting={insertBlankMutation.isPending}
        onInsert={handleInsertBlank}
        onCancel={() => setShowInsertBlank(false)}
      />

      {/* Insert PDF pages */}
      <InsertPdfModal
        open={showInsertPdf}
        targetPageNumber={selectedPageNumber}
        documentId={id}
        isInserting={insertFromSourceMutation.isPending}
        onUpload={uploadSource.upload}
        uploadProgress={uploadSource.progress}
        uploadPending={uploadSource.isPending}
        uploadError={uploadSource.error}
        onInsert={handleInsertFromSource}
        onCancel={() => setShowInsertPdf(false)}
      />
    </DndProvider>
  );
}
