import api from '@/services/api';
import type { APIResponse } from '@/types/api';
import type {
  SignatureRecord,
  DocumentSignatureRecord,
  SignedDocumentRecord,
  HandwritingFont,
} from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000';

/** Browser-accessible URL for a signature's PNG image. */
export function getSignatureImageUrl(signatureId: string): string {
  return `${BASE}/signatures/${signatureId}/image`;
}

export const signingApi = {
  // ── Signature creation ─────────────────────────────────────────────────────

  draw: async (blob: Blob): Promise<APIResponse<SignatureRecord>> => {
    const form = new FormData();
    form.append('file', blob, 'signature.png');
    const { data } = await api.post<APIResponse<SignatureRecord>>(
      '/signatures/draw',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  upload: async (file: File): Promise<APIResponse<SignatureRecord>> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<APIResponse<SignatureRecord>>(
      '/signatures/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  type: async (text: string, font: HandwritingFont): Promise<APIResponse<SignatureRecord>> => {
    const { data } = await api.post<APIResponse<SignatureRecord>>('/signatures/type', {
      text,
      font,
    });
    return data;
  },

  // ── Signature retrieval ────────────────────────────────────────────────────

  list: async (): Promise<APIResponse<SignatureRecord[]>> => {
    const { data } = await api.get<APIResponse<SignatureRecord[]>>('/signatures');
    return data;
  },

  delete: async (signatureId: string): Promise<void> => {
    await api.delete(`/signatures/${signatureId}`);
  },

  // ── Signing operations ─────────────────────────────────────────────────────

  applySignature: async (
    documentId: string,
    fieldId: string,
    signatureId: string,
  ): Promise<APIResponse<DocumentSignatureRecord>> => {
    const { data } = await api.post<APIResponse<DocumentSignatureRecord>>(
      `/documents/${documentId}/fields/${fieldId}/sign`,
      { signature_id: signatureId },
    );
    return data;
  },

  listSigned: async (documentId: string): Promise<APIResponse<SignedDocumentRecord[]>> => {
    const { data } = await api.get<APIResponse<SignedDocumentRecord[]>>(
      `/documents/${documentId}/signed-documents`,
    );
    return data;
  },

  generate: async (documentId: string): Promise<APIResponse<SignedDocumentRecord>> => {
    const { data } = await api.post<APIResponse<SignedDocumentRecord>>(
      `/documents/${documentId}/generate`,
    );
    return data;
  },

  downloadSigned: async (signedDocId: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/signed-documents/${signedDocId}`, {
      responseType: 'blob',
    });
    return data;
  },
};
