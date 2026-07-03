import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signingApi } from '../api/signingApi';
import { signaturesQueryKey } from './useSignatures';
import type { CreateSignatureInput } from '../types';

export function useCreateSignature() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSignatureInput) => {
      if (input.type === 'draw') return signingApi.draw(input.blob);
      if (input.type === 'upload') return signingApi.upload(input.file);
      return signingApi.type(input.text, input.font);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: signaturesQueryKey });
    },
  });
}
