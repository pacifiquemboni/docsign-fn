import { useCallback, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useToast } from '@/hooks/useToast';
import { useDocument } from '@/features/documents/hooks/useDocument';
import { useDocumentPages } from '@/features/documents/hooks/useDocumentPages';
import { useRotatePage } from '@/features/documents/hooks/useRotatePage';
import { useDeletePage } from '@/features/documents/hooks/useDeletePage';
import { useDuplicatePage } from '@/features/documents/hooks/useDuplicatePage';
import { useReorderPages } from '@/features/documents/hooks/useReorderPages';
import { useInsertBlankPage } from '@/features/documents/hooks/useInsertBlankPage';
import { useInsertFromSource } from '@/features/documents/hooks/useInsertFromSource';
import { useUploadSourceDocument } from '@/features/documents/hooks/useUploadSourceDocument';
import { useSaveDocument } from '@/features/documents/hooks/useSaveDocument';
import { useDownloadDocument } from '@/features/documents/hooks/useDownloadDocument';
import { useDocumentFields } from '../hooks/useDocumentFields';
import { useCreateField } from '../hooks/useCreateField';
import { useMoveField } from '../hooks/useMoveField';
import { useResizeField } from '../hooks/useResizeField';
import { useUpdateField } from '../hooks/useUpdateField';
import { useDeleteField } from '../hooks/useDeleteField';
import { useDuplicateField } from '../hooks/useDuplicateField';
import { useLockField } from '../hooks/useLockField';
import { DocumentHeader } from '@/features/documents/components/DocumentHeader';
import { Toolbar } from '@/features/documents/components/Toolbar';
import { DeletePageDialog } from '@/features/documents/components/DeletePageDialog';
import { InsertBlankPageModal } from '@/features/documents/components/InsertBlankPageModal';
import { InsertPdfModal } from '@/features/documents/components/InsertPdfModal';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { LeftPanel } from '../components/LeftPanel';
import { PDFViewer } from '../components/PDFViewer';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { FIELD_LABELS } from '../utils/fieldDefaults';
import type {
  FieldType,
  MoveFieldPayload,
  ResizeFieldPayload,
  UpdateFieldPayload,
} from '../types';
import type { ZoomLevel, InsertBlankPageRequest, InsertFromSourceRequest } from '@/features/documents/types';

export function DocumentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomLevel>(1.0);
  const [pdfVersion, setPdfVersion] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showInsertBlank, setShowInsertBlank] = useState(false);
  const [showInsertPdf, setShowInsertPdf] = useState(false);

  if (!id) return <Navigate to="/documents" replace />;

  // ── Server data ──────────────────────────────────────────────────────────────
  const { data: docRes,   isLoading: docLoading,   error: docError }   = useDocument(id);
  const { data: pagesRes, isLoading: pagesLoading }                     = useDocumentPages(id);
  const { data: fieldsRes }                                              = useDocumentFields(id);

  const document = docRes?.data;
  const pages    = pagesRes?.data ?? [];
  const fields   = fieldsRes?.data ?? [];

  // ── Page mutations ───────────────────────────────────────────────────────────
  const rotateMutation    = useRotatePage(id);
  const deleteMutation    = useDeletePage(id);
  const duplicateMutation = useDuplicatePage(id);
  const reorderMutation   = useReorderPages(id);
  const saveMutation      = useSaveDocument(id);
  const downloadMutation  = useDownloadDocument();
  const insertBlankMutation   = useInsertBlankPage(id);
  const insertFromSrcMutation = useInsertFromSource(id);
  const uploadSource          = useUploadSourceDocument(id);

  // ── Field mutations ──────────────────────────────────────────────────────────
  const createField    = useCreateField(id);
  const moveField      = useMoveField(id);
  const resizeField    = useResizeField(id);
  const updateField    = useUpdateField(id);
  const deleteField    = useDeleteField(id);
  const duplicateField = useDuplicateField(id);
  const lockField      = useLockField(id);

  // ── Page handlers ─────────────────────────────────────────────────────────
  const handleRotate = useCallback(() => {
    rotateMutation.mutate(
      { pageNumber: selectedPageNumber, degrees: 90 },
      { onError: (e) => showError(e.message) },
    );
  }, [selectedPageNumber, rotateMutation, showError]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget === null) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (selectedPageNumber === deleteTarget && selectedPageNumber > 1)
          setSelectedPageNumber((p) => p - 1);
        showSuccess('Page deleted');
      },
      onError: (e) => { setDeleteTarget(null); showError(e.message); },
    });
  }, [deleteTarget, deleteMutation, selectedPageNumber, showSuccess, showError]);

  const handleDuplicate = useCallback(
    (pageNumber: number) => {
      duplicateMutation.mutate(pageNumber, {
        onSuccess: (res) => {
          const newPage = res.data?.find((p) => p.page_number === pageNumber + 1);
          if (newPage) setSelectedPageNumber(newPage.page_number);
          showSuccess('Page duplicated');
        },
        onError: (e) => showError(e.message),
      });
    },
    [duplicateMutation, showSuccess, showError],
  );

  const handleReorder = useCallback(
    (newPageNumbers: number[]) => {
      reorderMutation.mutate(newPageNumbers, {
        onError: (e) => showError(e.message),
      });
    },
    [reorderMutation, showError],
  );

  const handleSave = useCallback(() => {
    saveMutation.mutate(undefined, {
      onSuccess: () => {
        setPdfVersion((v) => v + 1);
        showSuccess('Document saved');
      },
      onError: (e) => showError(e.message),
    });
  }, [saveMutation, showSuccess, showError]);

  const handleDownload = useCallback(() => {
    if (!document) return;
    void downloadMutation.download(id, document.original_name);
  }, [id, document, downloadMutation]);

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
        onError: (e) => { setShowInsertBlank(false); showError(e.message); },
      });
    },
    [insertBlankMutation, showSuccess, showError],
  );

  const handleInsertFromSource = useCallback(
    (req: InsertFromSourceRequest) => {
      insertFromSrcMutation.mutate(req, {
        onSuccess: (res) => {
          setShowInsertPdf(false);
          const insertAt = req.position === 'after' ? req.target_page + 1 : req.target_page;
          const newPage = res.data?.find((p) => p.page_number === insertAt);
          if (newPage) setSelectedPageNumber(newPage.page_number);
          showSuccess(`${req.pages.length} page${req.pages.length > 1 ? 's' : ''} inserted`);
        },
        onError: (e) => { setShowInsertPdf(false); showError(e.message); },
      });
    },
    [insertFromSrcMutation, showSuccess, showError],
  );

  // ── Field handlers ───────────────────────────────────────────────────────────
  const handleDropCreate = useCallback(
    (type: FieldType, page: number, x: number, y: number, width: number, height: number) => {
      createField.mutate(
        {
          field_type: type,
          page_number: page,
          x,
          y,
          width,
          height,
          label: FIELD_LABELS[type],
          required: false,
        },
        {
          onSuccess: (res) => {
            if (res.data) setSelectedFieldId(res.data.id);
            showSuccess(`${type} field added`);
          },
          onError: (e) => showError(e.message),
        },
      );
    },
    [createField, showSuccess, showError],
  );

  const handleMoveField = useCallback(
    (fieldId: string, payload: MoveFieldPayload) => {
      moveField.mutate({ fieldId, payload }, { onError: (e) => showError(e.message) });
    },
    [moveField, showError],
  );

  const handleResizeField = useCallback(
    (fieldId: string, payload: ResizeFieldPayload) => {
      resizeField.mutate({ fieldId, payload }, { onError: (e) => showError(e.message) });
    },
    [resizeField, showError],
  );

  const handleUpdateField = useCallback(
    (fieldId: string, payload: UpdateFieldPayload) => {
      updateField.mutate({ fieldId, payload }, { onError: (e) => showError(e.message) });
    },
    [updateField, showError],
  );

  const handleDeleteField = useCallback(
    (fieldId: string) => {
      deleteField.mutate(fieldId, {
        onSuccess: () => {
          if (selectedFieldId === fieldId) setSelectedFieldId(null);
          showSuccess('Field deleted');
        },
        onError: (e) => showError(e.message),
      });
    },
    [deleteField, selectedFieldId, showSuccess, showError],
  );

  const handleDuplicateField = useCallback(
    (fieldId: string) => {
      duplicateField.mutate(fieldId, {
        onSuccess: (res) => {
          if (res.data) setSelectedFieldId(res.data.id);
          showSuccess('Field duplicated');
        },
        onError: (e) => showError(e.message),
      });
    },
    [duplicateField, showSuccess, showError],
  );

  const handleToggleLock = useCallback(
    (fieldId: string) => {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) return;
      lockField.mutate(
        { fieldId, lock: !field.locked },
        { onError: (e) => showError(e.message) },
      );
    },
    [fields, lockField, showError],
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

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Top header */}
      <DocumentHeader
        document={document}
        isSaving={saveMutation.isPending}
        isDownloading={downloadMutation.downloading}
        onSave={handleSave}
        onDownload={handleDownload}
      />

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Pages / Fields tabs */}
        <LeftPanel
          pages={pages}
          selectedPageNumber={selectedPageNumber}
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
          fieldCount={fields.length}
        />

        {/* Centre: Toolbar + PDF viewer */}
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

          <PDFViewer
            documentId={id}
            pages={pages}
            fields={fields}
            zoom={zoom}
            pdfVersion={pdfVersion}
            selectedPageNumber={selectedPageNumber}
            selectedFieldId={selectedFieldId}
            isDuplicating={duplicateField.isPending}
            isDeleting={deleteField.isPending}
            isLocking={lockField.isPending}
            onSelectPage={setSelectedPageNumber}
            onSelectField={setSelectedFieldId}
            onDropCreate={handleDropCreate}
            onMove={handleMoveField}
            onResize={handleResizeField}
            onDuplicate={handleDuplicateField}
            onDelete={handleDeleteField}
            onToggleLock={handleToggleLock}
          />
        </div>

        {/* Right: Properties panel */}
        <PropertiesPanel
          field={selectedField}
          isUpdating={updateField.isPending}
          isLocking={lockField.isPending}
          onClose={() => setSelectedFieldId(null)}
          onUpdate={handleUpdateField}
          onToggleLock={handleToggleLock}
        />
      </div>

      {/* Dialogs */}
      <DeletePageDialog
        pageNumber={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <InsertBlankPageModal
        open={showInsertBlank}
        targetPageNumber={selectedPageNumber}
        totalPages={pages.length}
        isInserting={insertBlankMutation.isPending}
        onInsert={handleInsertBlank}
        onCancel={() => setShowInsertBlank(false)}
      />

      <InsertPdfModal
        open={showInsertPdf}
        targetPageNumber={selectedPageNumber}
        documentId={id}
        isInserting={insertFromSrcMutation.isPending}
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
