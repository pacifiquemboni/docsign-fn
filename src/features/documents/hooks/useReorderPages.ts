import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { APIListResponse } from '@/types/api';
import type { DocumentPage } from '../types';
import { documentApi } from '../api/documentApi';

export function useReorderPages(documentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (pages: number[]) =>
      documentApi.reorderPages(documentId, pages),

    onMutate: async (newOrder: number[]) => {
      await qc.cancelQueries({
        queryKey: ['documents', documentId, 'pages'],
      });

      const snapshot = qc.getQueryData<APIListResponse<DocumentPage>>([
        'documents',
        documentId,
        'pages',
      ]);

      if (snapshot?.data) {
        const byNumber = new Map(snapshot.data.map((p) => [p.page_number, p]));
        const reordered = newOrder.map((num, idx) => ({
          ...byNumber.get(num)!,
          page_number: idx + 1,
        }));
        qc.setQueryData(['documents', documentId, 'pages'], {
          ...snapshot,
          data: reordered,
        });
      }

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        qc.setQueryData(
          ['documents', documentId, 'pages'],
          context.snapshot,
        );
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'pages'] });
      qc.invalidateQueries({ queryKey: ['documents', documentId, 'viewer'] });
    },
  });
}
