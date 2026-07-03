import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../api/sessionApi';

export const sessionQueryKey = (sessionId: string) =>
  ['sessions', sessionId] as const;

export function useSession(sessionId: string | undefined, refetchInterval?: number) {
  return useQuery({
    queryKey: sessionQueryKey(sessionId ?? ''),
    queryFn: () => sessionApi.get(sessionId!),
    enabled: !!sessionId,
    staleTime: 10_000,
    refetchInterval,
    select: (res) => res.data ?? null,
  });
}
