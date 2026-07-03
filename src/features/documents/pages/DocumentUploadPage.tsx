import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileUploadZone } from '../components/FileUploadZone';
import { UploadProgressCard } from '../components/UploadProgressCard';
import { useUploadDocument } from '../hooks/useUploadDocument';

type PageState = 'idle' | 'uploading' | 'success' | 'error';

export function DocumentUploadPage() {
  const navigate = useNavigate();
  const { mutate, isPending, isSuccess, isError, error, progress, cancel, reset } =
    useUploadDocument();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const pageState: PageState = isPending
    ? 'uploading'
    : isSuccess
      ? 'success'
      : isError
        ? 'error'
        : 'idle';

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    mutate(file);
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
  };

  const handleCancel = () => {
    cancel();
    setSelectedFile(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* Back nav */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate('/documents')}
      >
        Back to Documents
      </Button>

      {/* Upload card */}
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload a PDF file to store, manage, and prepare it for signing.
          </p>
        </div>

        {pageState === 'idle' ? (
          <FileUploadZone onFileSelect={handleFileSelect} />
        ) : (
          selectedFile && (
            <UploadProgressCard
              file={selectedFile}
              state={pageState}
              progress={progress}
              error={isError ? (error instanceof Error ? error.message : 'Upload failed') : null}
              onCancel={handleCancel}
              onReset={handleReset}
            />
          )
        )}

        {/* Success action */}
        {isSuccess && (
          <div className="mt-5 flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <FileCheck2 className="h-4 w-4" />
              Document uploaded successfully
            </div>
            <Button size="sm" onClick={() => navigate('/documents')}>
              View Documents
            </Button>
          </div>
        )}
      </Card>

      {/* Tips */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Tips
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li>• Only PDF files are supported (max 50 MB)</li>
          <li>• Documents are stored securely and can be downloaded any time</li>
          <li>• Page count and checksum are extracted automatically</li>
        </ul>
      </div>
    </div>
  );
}
