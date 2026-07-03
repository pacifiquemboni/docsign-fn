import { useState } from 'react';
import { documentApi } from '../api/documentApi';
import type { UploadSourceResponse } from '../types';

export function useUploadSourceDocument(documentId: string) {
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadSourceResponse | null> => {
    setIsPending(true);
    setProgress(0);
    setError(null);
    try {
      const res = await documentApi.uploadSourceDocument(documentId, file, setProgress);
      return res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { upload, isPending, progress, error };
}
