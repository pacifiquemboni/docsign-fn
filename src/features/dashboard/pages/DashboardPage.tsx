import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DocumentStatusBadge } from '@/features/documents/components/DocumentStatusBadge';
import { DocumentTableSkeleton } from '@/features/documents/components/DocumentTableSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatsCard } from '../components/StatsCard';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { formatDate, formatFileSize, truncateFilename } from '@/utils/formatters';
import type { Document } from '@/features/documents/types';

function countByStatus(docs: Document[], status: string) {
  return docs.filter((d) => d.status === status).length;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDocuments({ skip: 0, limit: 100 });

  const documents = data?.data ?? [];
  const total = data?.total ?? 0;
  const ready = countByStatus(documents, 'READY');
  const signed = countByStatus(documents, 'SIGNED');
  const recent = [...documents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your documents.
          </p>
        </div>
        <Button
          size="sm"
          icon={<Upload className="h-4 w-4" />}
          onClick={() => navigate('/documents/upload')}
        >
          Upload PDF
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Documents"
          value={isLoading ? '—' : total}
          icon={FileText}
          color="blue"
          loading={isLoading}
        />
        <StatsCard
          title="Ready to Sign"
          value={isLoading ? '—' : ready}
          icon={CheckCircle2}
          color="green"
          loading={isLoading}
        />
        <StatsCard
          title="Signed"
          value={isLoading ? '—' : signed}
          icon={CheckCircle2}
          color="purple"
          loading={isLoading}
        />
        <StatsCard
          title="Recent Uploads"
          value={isLoading ? '—' : recent.length}
          subtitle="Last 5 documents"
          icon={Clock}
          color="amber"
          loading={isLoading}
        />
      </div>

      {/* Recent documents */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Documents
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
            onClick={() => navigate('/documents')}
          >
            View all
          </Button>
        </div>

        {isLoading ? (
          <DocumentTableSkeleton rows={5} />
        ) : isError ? (
          <ErrorState
            title="Failed to load documents"
            onRetry={() => void refetch()}
          />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload your first PDF to get started."
            action={
              <Button
                size="sm"
                icon={<Upload className="h-4 w-4" />}
                onClick={() => navigate('/documents/upload')}
              >
                Upload PDF
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Status', 'Size', 'Uploaded'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {recent.map((doc) => (
                  <tr
                    key={doc.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                          <FileText className="h-4 w-4 text-brand-600" />
                        </div>
                        <span
                          className="max-w-xs truncate text-sm font-medium text-gray-900"
                          title={doc.original_name}
                        >
                          {truncateFilename(doc.original_name)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DocumentStatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(doc.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
