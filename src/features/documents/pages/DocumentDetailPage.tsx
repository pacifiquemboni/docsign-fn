import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  Hash,
  Calendar,
  HardDrive,
  BookOpen,
  Pencil,
  PenLine,
  Send,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState } from '@/components/common/ErrorState';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DocumentStatusBadge } from '../components/DocumentStatusBadge';
import { useDocument } from '../hooks/useDocument';
import { useDeleteDocument } from '../hooks/useDeleteDocument';
import { useDownloadDocument } from '../hooks/useDownloadDocument';
import { useSignedDocuments } from '@/features/signing/hooks/useSignedDocuments';
import { useDownloadSigned } from '@/features/signing/hooks/useGenerateDocument';
import {
  formatDateTime,
  formatFileSize,
} from '@/utils/formatters';

interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetaRow({ icon, label, value }: MetaRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 break-all text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useDocument(id);
  const { download, downloading } = useDownloadDocument();
  const deleteMutation  = useDeleteDocument();
  const downloadSigned  = useDownloadSigned();
  const { data: signedDocs = [] } = useSignedDocuments(id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const document = data?.data;

  if (isLoading) return <PageSpinner />;

  if (isError || !document) {
    return (
      <ErrorState
        title="Document not found"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Back nav */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate('/documents')}
      >
        Back to Documents
      </Button>

      {/* Header card */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
              <FileText className="h-6 w-6 text-brand-600" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h2
                className="truncate text-lg font-semibold text-gray-900"
                title={document.original_name}
              >
                {document.original_name}
              </h2>
              <div className="mt-1.5">
                <DocumentStatusBadge status={document.status} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Send className="h-4 w-4" />}
              onClick={() => navigate(`/documents/${document.id}/session`)}
            >
              Request Signatures
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<PenLine className="h-4 w-4" />}
              onClick={() => navigate(`/documents/${document.id}/sign`)}
            >
              Sign Document
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => navigate(`/documents/${document.id}/edit`)}
            >
              Open Editor
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              loading={downloading}
              onClick={() => void download(document.id, document.original_name)}
            >
              Download
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Metadata card */}
      <Card>
        <CardHeader>
          <CardTitle>File Information</CardTitle>
        </CardHeader>
        <div className="divide-y divide-gray-50">
          <MetaRow
            icon={<FileText className="h-4 w-4" />}
            label="Original filename"
            value={document.original_name}
          />
          <MetaRow
            icon={<HardDrive className="h-4 w-4" />}
            label="File size"
            value={formatFileSize(document.file_size)}
          />
          <MetaRow
            icon={<BookOpen className="h-4 w-4" />}
            label="Pages"
            value={`${document.page_count} page${document.page_count !== 1 ? 's' : ''}`}
          />
          <MetaRow
            icon={<Hash className="h-4 w-4" />}
            label="SHA-256 checksum"
            value={document.checksum}
          />
          <MetaRow
            icon={<Calendar className="h-4 w-4" />}
            label="Uploaded"
            value={formatDateTime(document.created_at)}
          />
          <MetaRow
            icon={<Calendar className="h-4 w-4" />}
            label="Last updated"
            value={formatDateTime(document.updated_at)}
          />
        </div>
      </Card>

      {/* Two-column action cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Sign entry point */}
        <Card className="flex min-h-48 items-center justify-center bg-indigo-50/60">
          <div className="text-center">
            <PenLine
              className="mx-auto mb-3 h-10 w-10 text-indigo-400"
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold text-gray-700">Sign this document</p>
            <p className="mt-1 mb-4 text-xs text-gray-400">
              Draw, upload, or type your signature on each field.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<PenLine className="h-4 w-4" />}
              onClick={() => navigate(`/documents/${document.id}/sign`)}
            >
              Sign Document
            </Button>
          </div>
        </Card>

        {/* Editor entry point */}
        <Card className="flex min-h-48 items-center justify-center bg-gray-50">
          <div className="text-center">
            <Pencil
              className="mx-auto mb-3 h-10 w-10 text-brand-400"
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold text-gray-700">Edit this document</p>
            <p className="mt-1 mb-4 text-xs text-gray-400">
              Place fields, rotate, reorder pages, then save.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => navigate(`/documents/${document.id}/edit`)}
            >
              Open Editor
            </Button>
          </div>
        </Card>
      </div>

      {/* Signed versions — shown whenever at least one signed PDF exists */}
      {signedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Signed versions</CardTitle>
          </CardHeader>
          <ul className="divide-y divide-gray-50">
            {signedDocs.map((sd, i) => (
              <li key={sd.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {i === 0 ? 'Latest signed PDF' : `Version ${signedDocs.length - i}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(sd.signed_at)} · {formatFileSize(sd.file_size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="h-3.5 w-3.5" />}
                  loading={downloadSigned.isPending}
                  onClick={() => {
                    const filename = `signed_${document.original_name.replace(/\.pdf$/i, '')}.pdf`;
                    downloadSigned.mutate({ signedDocId: sd.id, filename });
                  }}
                >
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete document"
        description={`"${document.original_name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(document.id, {
            onSuccess: () => navigate('/documents'),
          });
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
