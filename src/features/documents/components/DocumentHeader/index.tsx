import { ArrowLeft, Download, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { Document } from '../../types';

interface DocumentHeaderProps {
  document: Document;
  isSaving: boolean;
  isDownloading: boolean;
  onSave: () => void;
  onDownload: () => void;
}

export function DocumentHeader({
  document,
  isSaving,
  isDownloading,
  onSave,
  onDownload,
}: DocumentHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => navigate('/documents')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Back to documents"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h1
            className="truncate text-sm font-semibold text-gray-900"
            title={document.original_name}
          >
            {document.original_name}
          </h1>
          <p className="text-xs text-gray-400">{document.page_count} pages</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<Download className="h-3.5 w-3.5" />}
          loading={isDownloading}
          disabled={isSaving}
          onClick={onDownload}
        >
          Download
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<Save className="h-3.5 w-3.5" />}
          loading={isSaving}
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </header>
  );
}
