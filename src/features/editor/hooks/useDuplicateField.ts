import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldApi } from '../api/fieldApi';
import { fieldsQueryKey } from './useDocumentFields';
import type { DocumentField } from '../types';
import type { APIListResponse } from '@/types/api';

export function useDuplicateField(documentId: string) {
  const qc = useQueryClient();
  const key = fieldsQueryKey(documentId);

  return useMutation({
    mutationFn: (fieldId: string) => fieldApi.duplicate(fieldId),

    onSuccess: (response) => {
      if (!response.data) return;
      qc.setQueryData<APIListResponse<DocumentField>>(key, (old) =>
        old
          ? { ...old, data: [...old.data, response.data!], total: old.total + 1 }
          : old,
      );
    },
  });
}
