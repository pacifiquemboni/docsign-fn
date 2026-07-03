import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

export function useRotatePage(documentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      pageNumber,
      degrees,
    }: {
      pageNumber: number;
      degrees: number;
    }) => documentApi.rotatePage(documentId, pageNumber, degrees),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'pages'] });
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'viewer'] });
    },
  });
}
