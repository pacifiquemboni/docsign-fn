import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';
import type { InsertFromSourceRequest } from '../types';

export function useInsertFromSource(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InsertFromSourceRequest) =>
      documentApi.insertFromSource(documentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'pages'] });
      void queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
    },
  });
}
