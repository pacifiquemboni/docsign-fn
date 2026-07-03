import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FileText, Loader2, XCircle } from 'lucide-react';
import { useDocumentPages } from '@/features/documents/hooks/useDocumentPages';
import { useDocumentFields } from '@/features/editor/hooks/useDocumentFields';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { useSigningContext } from '@/features/sessions/hooks/useSigningContext';
import { useCompleteSigning, useDeclineSigning } from '@/features/sessions/hooks/useSessionMutations';
import { useApplySignature } from '../hooks/useApplySignature';
import { SigningViewer } from '../components/SigningViewer';
import { SignatureDialog } from '../components/SignatureDialog';
import { SigningProgress } from '../components/SigningProgress';
import { FinishSigningDialog } from '../components/FinishSigningDialog';
import {
  getCompletionSummary, getIncompleteRequired, isFieldCompleted,
  todayIso, formatDisplayDate,
} from '../utils/signingHelpers';
import type { DocumentField } from '@/features/editor/types';
import type { FieldCompletions } from '../types';
import type { ZoomLevel } from '@/features/documents/types';

export function RecipientSigningPage() {
  const { token } = useParams<{ token: string }>();
  const { showError, showSuccess } = useToast();

  // ── Load signing context from token ───────────────────────────────────────
  const { data: ctx, isLoading: ctxLoading, error: ctxError } = useSigningContext(token);

  // ── Load document data ─────────────────────────────────────────────────────
  const { data: pagesRes, isLoading: pagesLoading } = useDocumentPages(ctx?.document_id ?? '');
  const { data: fieldsRes } = useDocumentFields(ctx?.document_id ?? '');

  const pages = pagesRes?.data ?? [];
  const allFields = fieldsRes?.data ?? [];

  // Filter to ONLY the fields assigned to this recipient
  const assignedFieldIds = useMemo(
    () => new Set((ctx?.assigned_fields ?? []).map((af) => af.field_id)),
    [ctx?.assigned_fields],
  );
  const fields = useMemo(
    () => allFields.filter((f) => assignedFieldIds.has(f.id)),
    [allFields, assignedFieldIds],
  );

  // ── Local signing state ────────────────────────────────────────────────────
  const [completions, setCompletions] = useState<FieldCompletions>({});
  const [zoom] = useState<ZoomLevel>(1.0);
  const [dialogFieldId, setDialogFieldId] = useState<string | null>(null);
  const [activeTextField, setActiveTextField] = useState<string | null>(null);
  const [navIndex, setNavIndex] = useState(0);
  const [showFinish, setShowFinish] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [isAlreadySigned, setIsAlreadySigned] = useState(ctx?.already_signed ?? false);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const applyMutation    = useApplySignature(ctx?.document_id ?? 'none');
  const completeMutation = useCompleteSigning();
  const declineMutation  = useDeclineSigning();

  // ── Progress ───────────────────────────────────────────────────────────────
  const summary = useMemo(() => getCompletionSummary(fields, completions), [fields, completions]);
  const incompleteRequired = useMemo(
    () => getIncompleteRequired(fields, completions),
    [fields, completions],
  );

  // ── Field handlers ─────────────────────────────────────────────────────────
  const handleFieldClick = useCallback(
    (field: DocumentField) => {
      const t = field.field_type;
      if (t === 'SIGNATURE' || t === 'INITIAL') { setDialogFieldId(field.id); return; }
      if (t === 'CHECKBOX') {
        const prev = completions[field.id];
        setCompletions((c) => ({
          ...c,
          [field.id]: { kind: 'checkbox', checked: !(prev?.kind === 'checkbox' && prev.checked) },
        }));
        return;
      }
      if (t === 'DATE') {
        if (!isFieldCompleted(field.id, completions)) {
          setCompletions((c) => ({ ...c, [field.id]: { kind: 'date', value: formatDisplayDate(todayIso()) } }));
        }
        return;
      }
      if (t === 'TEXT') { setActiveTextField((p) => (p === field.id ? null : field.id)); }
    },
    [completions],
  );

  const handleTextCommit = useCallback((fieldId: string, value: string) => {
    setActiveTextField(null);
    if (value.trim()) setCompletions((c) => ({ ...c, [fieldId]: { kind: 'text', value } }));
  }, []);

  const dialogField = dialogFieldId ? fields.find((f) => f.id === dialogFieldId) ?? null : null;

  const handleApplySignature = useCallback(
    (signatureId: string) => {
      if (!dialogFieldId) return;
      const fid = dialogFieldId;
      setDialogFieldId(null);
      setCompletions((c) => ({ ...c, [fid]: { kind: 'signature', signature_id: signatureId, record: null } }));
      applyMutation.mutate(
        { fieldId: fid, signatureId },
        {
          onSuccess: (res) => {
            if (res.data) {
              setCompletions((c) => ({
                ...c,
                [fid]: { kind: 'signature', signature_id: signatureId, record: res.data! },
              }));
            }
          },
          onError: (err) => {
            setCompletions((c) => { const n = { ...c }; delete n[fid]; return n; });
            showError(err.message);
          },
        },
      );
    },
    [dialogFieldId, applyMutation, showError],
  );

  // ── Navigation ─────────────────────────────────────────────────────────────
  const highlightedFieldId = incompleteRequired[navIndex]?.id ?? null;

  // ── Complete / Decline ────────────────────────────────────────────────────
  const handleComplete = useCallback(() => {
    if (!token) return;
    completeMutation.mutate(token, {
      onSuccess: () => {
        setShowFinish(false);
        setIsAlreadySigned(true);
        showSuccess('Signing complete — thank you!');
      },
      onError: (e) => { setShowFinish(false); showError(e.message); },
    });
  }, [token, completeMutation, showSuccess, showError]);

  const handleDecline = useCallback(() => {
    if (!token) return;
    declineMutation.mutate({ token }, {
      onSuccess: () => { setShowDeclineConfirm(false); setIsAlreadySigned(true); },
      onError: (e) => { setShowDeclineConfirm(false); showError(e.message); },
    });
  }, [token, declineMutation, showError]);

  // ── Error states ───────────────────────────────────────────────────────────
  if (ctxLoading || pagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (ctxError || !ctx) {
    const msg = (ctxError as Error | null)?.message ?? '';
    const isExpired = msg.includes('expired') || msg.includes('invalid');
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <h1 className="text-xl font-bold text-gray-900">
          {isExpired ? 'This link has expired' : 'Invalid signing link'}
        </h1>
        <p className="max-w-sm text-sm text-gray-500">
          {isExpired
            ? 'This signing link is no longer valid. Contact the document sender to request a new one.'
            : 'This link may be invalid or already used. Please check your email for the correct link.'}
        </p>
      </div>
    );
  }

  // ── Already signed ─────────────────────────────────────────────────────────
  if (isAlreadySigned) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h1 className="text-xl font-bold text-gray-900">You've already signed</h1>
        <p className="max-w-sm text-sm text-gray-500">
          Your signature has been recorded. The document owner will be notified once all parties have signed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="h-5 w-5 shrink-0 text-indigo-500" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{ctx.session_title}</p>
            <p className="text-xs text-gray-400">Signing as {ctx.recipient_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeclineConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Decline
          </button>
          <button
            type="button"
            onClick={() => setShowFinish(true)}
            disabled={completeMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {completeMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {summary.allRequiredDone ? 'Finish Signing' : 'Finish'}
          </button>
        </div>
      </header>

      {/* Progress */}
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
        documentId={ctx.document_id}
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
        isGenerating={completeMutation.isPending}
        onConfirm={handleComplete}
        onCancel={() => setShowFinish(false)}
      />

      {/* Decline confirm */}
      {showDeclineConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowDeclineConfirm(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-semibold text-gray-900">Decline to sign?</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              The document owner will be notified that you have declined.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowDeclineConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Go back
              </button>
              <button type="button" onClick={handleDecline} disabled={declineMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40">
                {declineMutation.isPending ? 'Declining…' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
