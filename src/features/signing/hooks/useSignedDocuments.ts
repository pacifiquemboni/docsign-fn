import { useQuery, useQueryClient } from '@tanstack/react-query';
import { signingApi } from '../api/signingApi';

export const signedDocumentsQueryKey = (documentId: string) =>
  ['documents', documentId, 'signed-documents'] as const;

export function useSignedDocuments(documentId: string | undefined) {
  return useQuery({
    queryKey: signedDocumentsQueryKey(documentId ?? ''),
    queryFn: () => signingApi.listSigned(documentId!),
    enabled: !!documentId,
    staleTime: 30_000,
    select: (res) => res.data ?? [],
  });
}

export function useInvalidateSignedDocuments() {
  const qc = useQueryClient();
  return (documentId: string) =>
    qc.invalidateQueries({ queryKey: signedDocumentsQueryKey(documentId) });
}
