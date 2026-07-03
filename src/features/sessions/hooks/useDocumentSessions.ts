import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../api/sessionApi';

export const documentSessionsQueryKey = (documentId: string) =>
  ['documents', documentId, 'sessions'] as const;

export function useDocumentSessions(documentId: string | undefined) {
  return useQuery({
    queryKey: documentSessionsQueryKey(documentId ?? ''),
    queryFn: () => sessionApi.listForDocument(documentId!),
    enabled: !!documentId,
    staleTime: 30_000,
    select: (res) => res.data ?? [],
  });
}
