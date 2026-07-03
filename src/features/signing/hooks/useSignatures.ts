import { useQuery } from '@tanstack/react-query';
import { signingApi } from '../api/signingApi';

export const signaturesQueryKey = ['signatures'] as const;

export function useSignatures() {
  return useQuery({
    queryKey: signaturesQueryKey,
    queryFn: () => signingApi.list(),
    staleTime: 60_000,
    select: (res) => res.data ?? [],
  });
}
