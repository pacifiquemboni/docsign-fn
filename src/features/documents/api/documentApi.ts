import api from '@/services/api';
import type { APIListResponse, APIResponse } from '@/types/api';
import type {
  Document,
  DocumentPage,
  InsertBlankPageRequest,
  InsertFromSourceRequest,
  ListDocumentsParams,
  UploadSourceResponse,
  ViewerData,
} from '../types';

// Sprint 1 — document CRUD
export const documentApi = {
  list: async (params: ListDocumentsParams = {}) => {
    const { data } = await api.get<APIListResponse<Document>>('/documents/', {
      params: { skip: params.skip ?? 0, limit: params.limit ?? 10 },
    });
    return data;
  },

  get: async (id: string) => {
    const { data } = await api.get<APIResponse<Document>>(`/documents/${id}`);
    return data;
  },

  upload: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<APIResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<APIResponse<Document>>(
      '/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );
    return data;
  },

  download: async (id: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<APIResponse<Document>>(`/documents/${id}`);
    return data;
  },

  // Sprint 2 — page management (served under /documents-view prefix)
  viewer: async (id: string) => {
    const { data } = await api.get<APIResponse<ViewerData>>(
      `/documents-view/${id}/viewer`,
    );
    return data;
  },

  pages: async (id: string) => {
    const { data } = await api.get<APIListResponse<DocumentPage>>(
      `/documents-view/${id}/pages`,
    );
    return data;
  },

  rotatePage: async (id: string, pageNumber: number, degrees: number) => {
    const { data } = await api.patch<APIResponse<DocumentPage>>(
      `/documents-view/${id}/pages/${pageNumber}/rotate`,
      { degrees },
    );
    return data;
  },

  deletePage: async (id: string, pageNumber: number) => {
    const { data } = await api.delete<APIResponse<null>>(
      `/documents-view/${id}/pages/${pageNumber}`,
    );
    return data;
  },

  reorderPages: async (id: string, pages: number[]) => {
    const { data } = await api.patch<APIListResponse<DocumentPage>>(
      `/documents-view/${id}/pages/reorder`,
      { pages },
    );
    return data;
  },

  saveDocument: async (id: string) => {
    const { data } = await api.post<APIResponse<null>>(
      `/documents-view/${id}/save`,
    );
    return data;
  },

  // Phase 3 — page insertion
  insertBlankPage: async (id: string, body: InsertBlankPageRequest) => {
    const { data } = await api.post<APIListResponse<DocumentPage>>(
      `/documents-view/${id}/pages/blank`,
      body,
    );
    return data;
  },

  uploadSourceDocument: async (
    id: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<APIResponse<UploadSourceResponse>>(
      `/documents-view/${id}/pages/upload-source`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );
    return data;
  },

  insertFromSource: async (id: string, body: InsertFromSourceRequest) => {
    const { data } = await api.post<APIListResponse<DocumentPage>>(
      `/documents-view/${id}/pages/insert-from-source`,
      body,
    );
    return data;
  },

  duplicatePage: async (id: string, pageNumber: number) => {
    const { data } = await api.post<APIListResponse<DocumentPage>>(
      `/documents-view/${id}/pages/${pageNumber}/duplicate`,
    );
    return data;
  },
};
