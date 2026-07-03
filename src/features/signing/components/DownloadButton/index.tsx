import { Download, Loader2 } from 'lucide-react';

interface DownloadButtonProps {
  signedDocId: string | null;
  documentName: string;
  isDownloading: boolean;
  onDownload: (signedDocId: string, filename: string) => void;
}

export function DownloadButton({
  signedDocId,
  documentName,
  isDownloading,
  onDownload,
}: DownloadButtonProps) {
  if (!signedDocId) return null;

  const filename = `signed_${documentName.replace(/\.pdf$/i, '')}.pdf`;

  return (
    <button
      type="button"
      onClick={() => onDownload(signedDocId, filename)}
      disabled={isDownloading}
      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      aria-label="Download signed PDF"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Download Signed PDF
    </button>
  );
}
