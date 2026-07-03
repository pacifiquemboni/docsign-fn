import api from '@/services/api';
import type { APIResponse } from '@/types/api';
import type {
  AddRecipientPayload,
  CreateSessionPayload,
  RecipientFieldResponse,
  RecipientResponse,
  SessionDetailResponse,
  SessionResponse,
  SigningContextResponse,
  SigningLinkResponse,
  UpdateRecipientPayload,
} from '../types';

export const sessionApi = {
  // ── Sessions ───────────────────────────────────────────────────────────────

  create: async (
    documentId: string,
    payload: CreateSessionPayload,
  ): Promise<APIResponse<SessionResponse>> => {
    const { data } = await api.post<APIResponse<SessionResponse>>(
      `/documents/${documentId}/sessions`,
      payload,
    );
    return data;
  },

  listForDocument: async (
    documentId: string,
  ): Promise<APIResponse<SessionResponse[]>> => {
    const { data } = await api.get<APIResponse<SessionResponse[]>>(
      `/documents/${documentId}/sessions`,
    );
    return data;
  },

  get: async (sessionId: string): Promise<APIResponse<SessionDetailResponse>> => {
    const { data } = await api.get<APIResponse<SessionDetailResponse>>(
      `/sessions/${sessionId}`,
    );
    return data;
  },

  send: async (sessionId: string): Promise<APIResponse<SessionResponse>> => {
    const { data } = await api.post<APIResponse<SessionResponse>>(
      `/sessions/${sessionId}/send`,
    );
    return data;
  },

  cancel: async (sessionId: string): Promise<APIResponse<SessionResponse>> => {
    const { data } = await api.post<APIResponse<SessionResponse>>(
      `/sessions/${sessionId}/cancel`,
    );
    return data;
  },

  // ── Recipients ─────────────────────────────────────────────────────────────

  addRecipient: async (
    sessionId: string,
    payload: AddRecipientPayload,
  ): Promise<APIResponse<RecipientResponse>> => {
    const { data } = await api.post<APIResponse<RecipientResponse>>(
      `/sessions/${sessionId}/recipients`,
      payload,
    );
    return data;
  },

  updateRecipient: async (
    recipientId: string,
    payload: UpdateRecipientPayload,
  ): Promise<APIResponse<RecipientResponse>> => {
    const { data } = await api.patch<APIResponse<RecipientResponse>>(
      `/recipients/${recipientId}`,
      payload,
    );
    return data;
  },

  removeRecipient: async (recipientId: string): Promise<void> => {
    await api.delete(`/recipients/${recipientId}`);
  },

  assignFields: async (
    recipientId: string,
    fieldIds: string[],
  ): Promise<APIResponse<RecipientFieldResponse[]>> => {
    const { data } = await api.post<APIResponse<RecipientFieldResponse[]>>(
      `/recipients/${recipientId}/fields`,
      { field_ids: fieldIds },
    );
    return data;
  },

  generateLink: async (
    recipientId: string,
  ): Promise<APIResponse<SigningLinkResponse>> => {
    const { data } = await api.post<APIResponse<SigningLinkResponse>>(
      `/recipients/${recipientId}/link`,
    );
    return data;
  },

  resend: async (
    recipientId: string,
  ): Promise<APIResponse<SigningLinkResponse>> => {
    const { data } = await api.post<APIResponse<SigningLinkResponse>>(
      `/recipients/${recipientId}/resend`,
    );
    return data;
  },

  // ── Public signing endpoints (token-based, no auth) ────────────────────────

  getSigningContext: async (
    token: string,
  ): Promise<APIResponse<SigningContextResponse>> => {
    const { data } = await api.get<APIResponse<SigningContextResponse>>(
      `/sign/${token}`,
    );
    return data;
  },

  completeSigning: async (
    token: string,
  ): Promise<APIResponse<RecipientResponse>> => {
    const { data } = await api.post<APIResponse<RecipientResponse>>(
      `/sign/${token}/complete`,
    );
    return data;
  },

  declineSigning: async (token: string, reason?: string): Promise<void> => {
    await api.post(`/sign/${token}/decline`, null, {
      params: reason ? { reason } : undefined,
    });
  },
};
