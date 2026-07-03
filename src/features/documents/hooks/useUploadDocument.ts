import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';
import { DOCUMENTS_QUERY_KEY } from './useDocuments';

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      abortControllerRef.current = new AbortController();
      return documentApi.upload(file, setProgress);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] });
    },
    onSettled: () => {
      setProgress(0);
    },
  });

  const cancel = () => {
    abortControllerRef.current?.abort();
    mutation.reset();
    setProgress(0);
  };

  return { ...mutation, progress, cancel };
}
