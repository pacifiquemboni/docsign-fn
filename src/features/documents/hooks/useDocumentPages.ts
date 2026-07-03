import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

export function useDocumentPages(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId, 'pages'],
    queryFn: () => documentApi.pages(documentId),
    enabled: Boolean(documentId),
    staleTime: 0,
  });
}
