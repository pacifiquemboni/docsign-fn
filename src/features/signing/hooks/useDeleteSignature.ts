import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signingApi } from '../api/signingApi';
import { signaturesQueryKey } from './useSignatures';

export function useDeleteSignature() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (signatureId: string) => signingApi.delete(signatureId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: signaturesQueryKey });
    },
  });
}
