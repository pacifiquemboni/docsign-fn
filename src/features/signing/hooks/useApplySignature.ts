import { useMutation } from '@tanstack/react-query';
import { signingApi } from '../api/signingApi';

export function useApplySignature(documentId: string) {
  return useMutation({
    mutationFn: ({ fieldId, signatureId }: { fieldId: string; signatureId: string }) =>
      signingApi.applySignature(documentId, fieldId, signatureId),
  });
}
