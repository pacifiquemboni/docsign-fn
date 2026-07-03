import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';
import { DOCUMENTS_QUERY_KEY } from './useDocuments';

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['documents', id] });
      void queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] });
    },
  });
}
