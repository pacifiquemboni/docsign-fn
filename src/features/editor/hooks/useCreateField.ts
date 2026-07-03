import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldApi } from '../api/fieldApi';
import { fieldsQueryKey } from './useDocumentFields';
import type { DocumentField, CreateFieldPayload } from '../types';
import type { APIListResponse } from '@/types/api';

export function useCreateField(documentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFieldPayload) =>
      fieldApi.create(documentId, payload),

    onSuccess: (response) => {
      if (!response.data) return;
      qc.setQueryData<APIListResponse<DocumentField>>(
        fieldsQueryKey(documentId),
        (old) =>
          old
            ? { ...old, data: [...old.data, response.data!], total: old.total + 1 }
            : { success: true, message: '', data: [response.data!], total: 1 },
      );
    },
  });
}
