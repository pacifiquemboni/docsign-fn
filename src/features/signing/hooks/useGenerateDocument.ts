import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signingApi } from '../api/signingApi';
import { triggerDownload } from '../utils/signingHelpers';
import { signedDocumentsQueryKey } from './useSignedDocuments';

export function useGenerateDocument(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => signingApi.generate(documentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: signedDocumentsQueryKey(documentId) });
    },
  });
}

export function useDownloadSigned() {
  return useMutation({
    mutationFn: async ({
      signedDocId,
      filename,
    }: {
      signedDocId: string;
      filename: string;
    }) => {
      const blob = await signingApi.downloadSigned(signedDocId);
      triggerDownload(blob, filename);
      return blob;
    },
  });
}
