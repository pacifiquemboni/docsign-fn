import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../api/sessionApi';

export function useSigningContext(token: string | undefined) {
  return useQuery({
    queryKey: ['signing-context', token],
    queryFn: () => sessionApi.getSigningContext(token!),
    enabled: !!token,
    staleTime: Infinity, // context doesn't change during a signing session
    retry: false,        // don't retry — expired/invalid tokens should fail fast
    select: (res) => res.data ?? null,
  });
}
