import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldApi } from '../api/fieldApi';
import { fieldsQueryKey } from './useDocumentFields';
import type { DocumentField } from '../types';
import type { APIListResponse } from '@/types/api';

export function useLockField(documentId: string) {
  const qc = useQueryClient();
  const key = fieldsQueryKey(documentId);

  return useMutation({
    mutationFn: ({ fieldId, lock }: { fieldId: string; lock: boolean }) =>
      lock ? fieldApi.lock(fieldId) : fieldApi.unlock(fieldId),

    onMutate: async ({ fieldId, lock }) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<APIListResponse<DocumentField>>(key);

      qc.setQueryData<APIListResponse<DocumentField>>(key, (old) =>
        old
          ? {
              ...old,
              data: old.data.map((f) =>
                f.id === fieldId ? { ...f, locked: lock } : f,
              ),
            }
          : old,
      );

      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(key, ctx.snapshot);
    },

    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
