import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionApi } from '../api/sessionApi';
import { sessionQueryKey } from './useSession';
import { documentSessionsQueryKey } from './useDocumentSessions';
import type {
  AddRecipientPayload,
  CreateSessionPayload,
  UpdateRecipientPayload,
} from '../types';

// ── Session lifecycle ──────────────────────────────────────────────────────────

export function useCreateSession(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) =>
      sessionApi.create(documentId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentSessionsQueryKey(documentId) });
    },
  });
}

export function useSendSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sessionApi.send(sessionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionQueryKey(sessionId) });
    },
  });
}

export function useCancelSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sessionApi.cancel(sessionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionQueryKey(sessionId) });
    },
  });
}

// ── Recipient management ──────────────────────────────────────────────────────

export function useAddRecipient(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddRecipientPayload) =>
      sessionApi.addRecipient(sessionId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionQueryKey(sessionId) });
    },
  });
}

export function useUpdateRecipient(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recipientId, payload }: { recipientId: string; payload: UpdateRecipientPayload }) =>
      sessionApi.updateRecipient(recipientId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionQueryKey(sessionId) });
    },
  });
}

export function useRemoveRecipient(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) => sessionApi.removeRecipient(recipientId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionQueryKey(sessionId) });
    },
  });
}

export function useAssignFields(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recipientId, fieldIds }: { recipientId: string; fieldIds: string[] }) =>
      sessionApi.assignFields(recipientId, fieldIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionQueryKey(sessionId) });
    },
  });
}

export function useResendInvitation(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) => sessionApi.resend(recipientId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionQueryKey(sessionId) });
    },
  });
}

// ── Recipient signing (token-based, no session context needed) ────────────────

export function useCompleteSigning() {
  return useMutation({
    mutationFn: (token: string) => sessionApi.completeSigning(token),
  });
}

export function useDeclineSigning() {
  return useMutation({
    mutationFn: ({ token, reason }: { token: string; reason?: string }) =>
      sessionApi.declineSigning(token, reason),
  });
}
