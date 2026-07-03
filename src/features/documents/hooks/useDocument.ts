import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentApi.get(id!),
    enabled: Boolean(id),
  });
}
