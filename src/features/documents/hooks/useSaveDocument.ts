import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

export function useSaveDocument(documentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => documentApi.saveDocument(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', documentId] });
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'pages'] });
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'viewer'] });
    },
  });
}
