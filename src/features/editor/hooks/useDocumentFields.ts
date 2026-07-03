import { useQuery } from '@tanstack/react-query';
import { fieldApi } from '../api/fieldApi';

export const fieldsQueryKey = (documentId: string) =>
  ['documents', documentId, 'fields'] as const;

export function useDocumentFields(documentId: string) {
  return useQuery({
    queryKey: fieldsQueryKey(documentId),
    queryFn: () => fieldApi.list(documentId),
    staleTime: 30_000,
  });
}
