import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';
import type { ListDocumentsParams } from '../types';

export const DOCUMENTS_QUERY_KEY = 'documents';

export function useDocuments(params: ListDocumentsParams = {}) {
  const { skip = 0, limit = 10 } = params;

  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, { skip, limit }],
    queryFn: () => documentApi.list({ skip, limit }),
    placeholderData: keepPreviousData,
  });
}
