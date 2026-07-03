import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';
import type { InsertBlankPageRequest } from '../types';

export function useInsertBlankPage(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InsertBlankPageRequest) =>
      documentApi.insertBlankPage(documentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'pages'] });
      void queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
    },
  });
}
