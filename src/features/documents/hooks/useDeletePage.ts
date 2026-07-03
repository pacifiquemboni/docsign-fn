import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

export function useDeletePage(documentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (pageNumber: number) =>
      documentApi.deletePage(documentId, pageNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'pages'] });
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'viewer'] });
    },
  });
}
