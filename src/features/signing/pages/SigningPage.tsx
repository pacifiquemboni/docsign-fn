import { useCallback, useMemo, useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useDocument } from '@/features/documents/hooks/useDocument';
import { useDocumentPages } from '@/features/documents/hooks/useDocumentPages';
import { useDocumentFields } from '@/features/editor/hooks/useDocumentFields';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { useApplySignature } from '../hooks/useApplySignature';
import { useGenerateDocument, useDownloadSigned } from '../hooks/useGenerateDocument';
import { useSignedDocuments } from '../hooks/useSignedDocuments';
import { SigningViewer } from '../components/SigningViewer';
import { SignatureDialog } from '../components/SignatureDialog';
import { SigningProgress } from '../components/SigningProgress';
import { FinishSigningDialog } from '../components/FinishSigningDialog';
import {
  getCompletionSummary,
  getIncompleteRequired,
  isFieldCompleted,
  todayIso,
  formatDisplayDate,
} from '../utils/signingHelpers';
import type { DocumentField } from '@/features/editor/types';
import type { FieldCompletions } from '../types';
import type { ZoomLevel } from '@/features/documents/types';

export function SigningPage() {
  const { id } = useParams<{ id: string }>();
  const { showError, showSuccess } = useToast();

  if (!id) return <Navigate to="/documents" replace />;

  // ── Server data ────────────────────────────────────────────────────────────
  const { data: docRes,    isLoading: docLoading,    error: docError } = useDocument(id);
  const { data: pagesRes,  isLoading: pagesLoading }                   = useDocumentPages(id);
  const { data: fieldsRes }                                             = useDocumentFields(id);
  const { data: signedDocs = [] }                                       = useSignedDocuments(id);

  const document = docRes?.data;
  const pages    = pagesRes?.data ?? [];
  const fields   = fieldsRes?.data ?? [];

  // Most-recent signed document (server-persisted, survives page refresh)
  const latestSigned = signedDocs.length > 0 ? signedDocs[0] : null;

  // ── Local signing state ────────────────────────────────────────────────────
  const [completions,    setCompletions]    = useState<FieldCompletions>({});
  const [zoom]                              = useState<ZoomLevel>(1.0);
  const [dialogFieldId,  setDialogFieldId]  = useState<string | null>(null);
  const [activeTextField,setActiveTextField]= useState<string | null>(null);
  const [navIndex,       setNavIndex]       = useState(0);
  const [showFinish,     setShowFinish]     = useState(false);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const applyMutation    = useApplySignature(id);
  const generateMutation = useGenerateDocument(id);
  const downloadMutation = useDownloadSigned();

  // ── Progress ───────────────────────────────────────────────────────────────
  const summary = useMemo(
    () => getCompletionSummary(fields, completions),
    [fields, completions],
  );
  const incompleteRequired = useMemo(
    () => getIncompleteRequired(fields, completions),
    [fields, completions],
  );

  // ── Field click dispatcher ─────────────────────────────────────────────────
  const handleFieldClick = useCallback(
    (field: DocumentField) => {
      const t = field.field_type;
      if (t === 'SIGNATURE' || t === 'INITIAL') { setDialogFieldId(field.id); return; }
      if (t === 'CHECKBOX') {
        const prev = completions[field.id];
        setCompletions((c) => ({
          ...c, [field.id]: { kind: 'checkbox', checked: !(prev?.kind === 'checkbox' && prev.checked) },
        }));
        return;
      }
      if (t === 'DATE') {
        if (!isFieldCompleted(field.id, completions)) {
          setCompletions((c) => ({ ...c, [field.id]: { kind: 'date', value: formatDisplayDate(todayIso()) } }));
        }
        return;
      }
      if (t === 'TEXT') setActiveTextField((p) => (p === field.id ? null : field.id));
    },
    [completions],
  );

  const handleTextCommit = useCallback((fieldId: string, value: string) => {
    setActiveTextField(null);
    if (value.trim()) setCompletions((c) => ({ ...c, [fieldId]: { kind: 'text', value } }));
  }, []);

  // ── Dialog: signature / initial ────────────────────────────────────────────
  const dialogField = dialogFieldId ? fields.find((f) => f.id === dialogFieldId) ?? null : null;

  const handleApplySignature = useCallback(
    (signatureId: string) => {
      if (!dialogFieldId) return;
      const fid = dialogFieldId;
      setDialogFieldId(null);
      setCompletions((c) => ({ ...c, [fid]: { kind: 'signature', signature_id: signatureId, record: null } }));
      applyMutation.mutate({ fieldId: fid, signatureId }, {
        onSuccess: (res) => {
          if (res.data) setCompletions((c) => ({ ...c, [fid]: { kind: 'signature', signature_id: signatureId, record: res.data! } }));
        },
        onError: (err) => {
          setCompletions((c) => { const n = { ...c }; delete n[fid]; return n; });
          showError(err.message);
        },
      });
    },
    [dialogFieldId, applyMutation, showError],
  );

  // ── Navigation ─────────────────────────────────────────────────────────────
  const highlightedFieldId = incompleteRequired[navIndex]?.id ?? null;

  // ── Generate & auto-download ──────────────────────────────────────────────
  const handleDownloadById = useCallback(
    (signedDocId: string) => {
      const filename = `signed_${document?.original_name.replace(/\.pdf$/i, '') ?? 'document'}.pdf`;
      downloadMutation.mutate({ signedDocId, filename }, {
        onError: (err) => showError(err.message),
      });
    },
    [downloadMutation, document, showError],
  );

  const handleGenerate = useCallback(() => {
    generateMutation.mutate(undefined, {
      onSuccess: (res) => {
        setShowFinish(false);
        if (res.data) {
          showSuccess('Signed PDF ready — downloading now');
          // Immediately trigger the download so users don't have to find a button
          handleDownloadById(res.data.id);
        }
      },
      onError: (err) => {
        setShowFinish(false);
        showError(err.message);
      },
    });
  }, [generateMutation, handleDownloadById, showSuccess, showError]);

  // ── Loading / error ────────────────────────────────────────────────────────
  if (docLoading || pagesLoading) {
    return <div className="flex h-screen items-center justify-center"><PageSpinner /></div>;
  }
  if (docError || !document) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState title="Document not found" message="This document may have been deleted." />
      </div>
    );
  }

  const isGenerating = generateMutation.isPending;

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/documents/${id}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Back to document"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Signing</p>
            <p className="truncate text-sm font-medium text-gray-900">{document.original_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Re-download button — visible whenever a signed version exists (even after refresh) */}
          {latestSigned && (
            <button
              type="button"
              onClick={() => handleDownloadById(latestSigned.id)}
              disabled={downloadMutation.isPending}
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
              aria-label="Download signed PDF"
            >
              {downloadMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download Signed PDF
            </button>
          )}

          {/* Finish / status indicator */}
          {latestSigned ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Signed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowFinish(true)}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {summary.allRequiredDone ? 'Finish Signing' : 'Finish'}
            </button>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <SigningProgress
        required={summary.required}
        completed={summary.completed}
        hasPrev={navIndex > 0}
        hasNext={navIndex < incompleteRequired.length - 1}
        onPrev={() => setNavIndex((i) => Math.max(0, i - 1))}
        onNext={() => setNavIndex((i) => Math.min(incompleteRequired.length - 1, i + 1))}
      />

      {/* PDF + fields */}
      <SigningViewer
        documentId={id}
        pages={pages}
        fields={fields}
        completions={completions}
        zoom={zoom}
        activeTextField={activeTextField}
        highlightedFieldId={highlightedFieldId}
        onFieldClick={handleFieldClick}
        onTextCommit={handleTextCommit}
      />

      {/* Signature dialog */}
      <SignatureDialog
        open={dialogFieldId !== null}
        mode={dialogField?.field_type === 'INITIAL' ? 'initials' : 'signature'}
        onClose={() => setDialogFieldId(null)}
        onApply={handleApplySignature}
      />

      {/* Finish dialog */}
      <FinishSigningDialog
        open={showFinish}
        incompleteCount={incompleteRequired.length}
        isGenerating={isGenerating}
        onConfirm={handleGenerate}
        onCancel={() => setShowFinish(false)}
      />
    </div>
  );
}
