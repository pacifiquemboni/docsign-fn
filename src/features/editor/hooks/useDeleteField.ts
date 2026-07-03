import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldApi } from '../api/fieldApi';
import { fieldsQueryKey } from './useDocumentFields';
import type { DocumentField } from '../types';
import type { APIListResponse } from '@/types/api';

export function useDeleteField(documentId: string) {
  const qc = useQueryClient();
  const key = fieldsQueryKey(documentId);

  return useMutation({
    mutationFn: (fieldId: string) => fieldApi.delete(fieldId),

    onMutate: async (fieldId) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<APIListResponse<DocumentField>>(key);

      qc.setQueryData<APIListResponse<DocumentField>>(key, (old) =>
        old
          ? { ...old, data: old.data.filter((f) => f.id !== fieldId), total: old.total - 1 }
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
