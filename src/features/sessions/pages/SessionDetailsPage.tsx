import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Loader2, Send, XCircle,
} from 'lucide-react';
import { useDocument } from '@/features/documents/hooks/useDocument';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { useSession } from '../hooks/useSession';
import {
  useAddRecipient, useAssignFields, useCancelSession,
  useRemoveRecipient, useResendInvitation, useSendSession, useUpdateRecipient,
} from '../hooks/useSessionMutations';
import { SessionStatusBadge } from '../components/SessionStatusBadge';
import { SessionProgress } from '../components/SessionProgress';
import { RecipientList } from '../components/RecipientList';
import { FieldAssignmentPanel } from '../components/FieldAssignmentPanel';
import { AuditTimeline } from '../components/AuditTimeline';
import type { FieldAssignmentMap } from '../types';

type Tab = 'recipients' | 'fields' | 'audit';

const ACTIVE_STATUSES = new Set(['SENT', 'IN_PROGRESS']);

export function SessionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [tab, setTab] = useState<Tab>('recipients');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Poll while session is active so progress updates live
  const [refetchInterval, setRefetchInterval] = useState<number | undefined>(undefined);
  const { data: session, isLoading, error } = useSession(id, refetchInterval);

  // Activate polling once we know the session status
  if (session && ACTIVE_STATUSES.has(session.status) && refetchInterval === undefined) {
    setRefetchInterval(15_000);
  } else if (session && !ACTIVE_STATUSES.has(session.status) && refetchInterval !== undefined) {
    setRefetchInterval(undefined);
  }

  const { data: docRes } = useDocument(session?.document_id);
  const document = docRes?.data;

  const sendMutation       = useSendSession(id!);
  const cancelMutation     = useCancelSession(id!);
  const addMutation        = useAddRecipient(id!);
  const updateMutation     = useUpdateRecipient(id!);
  const removeMutation     = useRemoveRecipient(id!);
  const resendMutation     = useResendInvitation(id!);
  const assignFieldsMutation = useAssignFields(id!);

  const handleSend = useCallback(() => {
    sendMutation.mutate(undefined, {
      onSuccess: () => showSuccess('Invitations sent to all recipients'),
      onError: (e) => showError(e.message),
    });
  }, [sendMutation, showSuccess, showError]);

  const handleCancel = useCallback(() => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => { setShowCancelConfirm(false); showSuccess('Session cancelled'); },
      onError: (e) => { setShowCancelConfirm(false); showError(e.message); },
    });
  }, [cancelMutation, showSuccess, showError]);

  const handleSaveFieldAssignments = useCallback(
    (assignments: FieldAssignmentMap) => {
      if (!session) return;
      // Group field IDs by recipient
      const byRecipient: Record<string, string[]> = {};
      for (const [fieldId, recipientId] of Object.entries(assignments)) {
        if (!recipientId) continue;
        (byRecipient[recipientId] ??= []).push(fieldId);
      }
      const calls = Object.entries(byRecipient).map(([recipientId, fieldIds]) =>
        assignFieldsMutation.mutateAsync({ recipientId, fieldIds }),
      );
      Promise.all(calls)
        .then(() => showSuccess('Field assignments saved'))
        .catch((e: Error) => showError(e.message));
    },
    [session, assignFieldsMutation, showSuccess, showError],
  );

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center"><PageSpinner /></div>
  );

  if (error || !session) return (
    <div className="flex h-64 items-center justify-center">
      <ErrorState title="Session not found" message="This session may have been deleted." />
    </div>
  );

  const isDraft     = session.status === 'DRAFT';
  const isCompleted = session.status === 'COMPLETED';
  const canSend     = isDraft && session.recipients.length > 0;
  const canCancel   = !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(session.status);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/sessions')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        All sessions
      </button>

      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 truncate">{session.title}</h1>
              <SessionStatusBadge status={session.status} size="md" />
            </div>
            {document && (
              <Link
                to={`/documents/${document.id}`}
                className="mt-0.5 text-xs text-indigo-500 hover:underline"
              >
                {document.original_name}
              </Link>
            )}
            {session.message && (
              <p className="mt-2 text-sm text-gray-500">{session.message}</p>
            )}
            <div className="mt-1 flex gap-4 text-xs text-gray-400">
              <span>{session.signing_order === 'SEQUENTIAL' ? 'Sequential signing' : 'Parallel signing'}</span>
              {session.expires_at && <span>Expires {new Date(session.expires_at).toLocaleDateString()}</span>}
              {session.completed_at && <span>Completed {new Date(session.completed_at).toLocaleDateString()}</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap gap-2">
            {canSend && (
              <button
                type="button"
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {sendMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send invitations
              </button>
            )}
            {isCompleted && document && (
              <Link
                to={`/documents/${document.id}`}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                View completed doc
              </Link>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress (only when there are recipients) */}
        {session.recipients.length > 0 && (
          <SessionProgress progress={session.progress} />
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['recipients', 'fields', 'audit'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 border-b-2 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'recipients' ? `Recipients (${session.recipients.length})` :
               t === 'fields' ? 'Field Assignment' :
               `Audit Trail (${session.recent_events.length})`}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'recipients' && (
            <RecipientList
              recipients={session.recipients}
              sessionStatus={session.status}
              isAddingRecipient={addMutation.isPending}
              isUpdatingRecipient={updateMutation.isPending}
              isRemovingRecipient={removeMutation.isPending}
              isResending={resendMutation.isPending}
              onAdd={(values) =>
                addMutation.mutate(values, {
                  onSuccess: () => showSuccess(`${values.full_name} added`),
                  onError: (e) => showError(e.message),
                })
              }
              onUpdate={(recipientId, values) =>
                updateMutation.mutate({ recipientId, payload: values }, {
                  onSuccess: () => showSuccess('Recipient updated'),
                  onError: (e) => showError(e.message),
                })
              }
              onRemove={(recipientId) =>
                removeMutation.mutate(recipientId, {
                  onSuccess: () => showSuccess('Recipient removed'),
                  onError: (e) => showError(e.message),
                })
              }
              onResend={(recipientId) =>
                resendMutation.mutate(recipientId, {
                  onSuccess: () => showSuccess('Reminder sent'),
                  onError: (e) => showError(e.message),
                })
              }
            />
          )}

          {tab === 'fields' && session.document_id && (
            <FieldAssignmentPanel
              documentId={session.document_id}
              recipients={session.recipients}
              onSave={handleSaveFieldAssignments}
              isSaving={assignFieldsMutation.isPending}
            />
          )}

          {tab === 'audit' && (
            <AuditTimeline
              events={session.recent_events}
              recipients={session.recipients}
            />
          )}
        </div>
      </div>

      {/* Cancel confirm */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowCancelConfirm(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-semibold text-gray-900">Cancel session?</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              All pending invitations will be revoked. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Keep session
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
