import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

export function useDuplicatePage(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageNumber: number) =>
      documentApi.duplicatePage(documentId, pageNumber),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'pages'] });
      void queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
    },
  });
}
