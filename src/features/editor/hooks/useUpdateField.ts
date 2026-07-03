import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldApi } from '../api/fieldApi';
import { fieldsQueryKey } from './useDocumentFields';
import type { DocumentField, UpdateFieldPayload } from '../types';
import type { APIListResponse } from '@/types/api';

export function useUpdateField(documentId: string) {
  const qc = useQueryClient();
  const key = fieldsQueryKey(documentId);

  return useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: string; payload: UpdateFieldPayload }) =>
      fieldApi.update(fieldId, payload),

    onMutate: async ({ fieldId, payload }) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<APIListResponse<DocumentField>>(key);

      qc.setQueryData<APIListResponse<DocumentField>>(key, (old) =>
        old
          ? {
              ...old,
              data: old.data.map((f) =>
                f.id === fieldId ? { ...f, ...payload } : f,
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
