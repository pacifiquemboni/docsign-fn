import { useState } from 'react';
import { documentApi } from '../api/documentApi';

export function useDownloadDocument() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (id: string, filename: string) => {
    setDownloading(true);
    setError(null);
    try {
      const blob = await documentApi.download(id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return { download, downloading, error };
}
