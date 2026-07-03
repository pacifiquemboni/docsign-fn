import api from '@/services/api';
import type { APIListResponse, APIResponse } from '@/types/api';
import type {
  DocumentField,
  PageFieldGroup,
  CreateFieldPayload,
  MoveFieldPayload,
  ResizeFieldPayload,
  UpdateFieldPayload,
} from '../types';

export const fieldApi = {
  /** Backend groups fields by page; flatten into a single array for the frontend cache. */
  list: async (documentId: string): Promise<APIListResponse<DocumentField>> => {
    const { data } = await api.get<APIResponse<PageFieldGroup[]>>(
      `/documents/${documentId}/fields`,
    );
    const flat = (data.data ?? []).flatMap((group) => group.fields);
    return { success: data.success, message: data.message, data: flat, total: flat.length };
  },

  create: async (documentId: string, payload: CreateFieldPayload) => {
    const { data } = await api.post<APIResponse<DocumentField>>(
      `/documents/${documentId}/fields`,
      payload,
    );
    return data;
  },

  update: async (fieldId: string, payload: UpdateFieldPayload) => {
    const { data } = await api.patch<APIResponse<DocumentField>>(
      `/fields/${fieldId}`,
      payload,
    );
    return data;
  },

  move: async (fieldId: string, payload: MoveFieldPayload) => {
    const { data } = await api.patch<APIResponse<DocumentField>>(
      `/fields/${fieldId}/move`,
      payload,
    );
    return data;
  },

  resize: async (fieldId: string, payload: ResizeFieldPayload) => {
    const { data } = await api.patch<APIResponse<DocumentField>>(
      `/fields/${fieldId}/resize`,
      payload,
    );
    return data;
  },

  delete: async (fieldId: string): Promise<void> => {
    await api.delete(`/fields/${fieldId}`);
  },

  duplicate: async (fieldId: string) => {
    const { data } = await api.post<APIResponse<DocumentField>>(
      `/fields/${fieldId}/duplicate`,
    );
    return data;
  },

  lock: async (fieldId: string) => {
    const { data } = await api.patch<APIResponse<DocumentField>>(
      `/fields/${fieldId}/lock`,
    );
    return data;
  },

  unlock: async (fieldId: string) => {
    const { data } = await api.patch<APIResponse<DocumentField>>(
      `/fields/${fieldId}/unlock`,
    );
    return data;
  },
};
