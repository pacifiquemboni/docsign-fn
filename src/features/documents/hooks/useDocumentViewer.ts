import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

export function useDocumentViewer(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId, 'viewer'],
    queryFn: () => documentApi.viewer(documentId),
    enabled: Boolean(documentId),
    staleTime: 30_000,
  });
}
