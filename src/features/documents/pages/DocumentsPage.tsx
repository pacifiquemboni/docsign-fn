import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { DocumentTable } from '../components/DocumentTable';
import { DocumentTableSkeleton } from '../components/DocumentTableSkeleton';
import { useDocuments } from '../hooks/useDocuments';

const PAGE_SIZE = 10;

export function DocumentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error, refetch, isFetching } = useDocuments({
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Documents</h2>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">
              {data.total} document{data.total !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => void refetch()}
            aria-label="Refresh"
          />
          <Button
            size="sm"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => navigate('/documents/upload')}
          >
            Upload PDF
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <DocumentTableSkeleton rows={PAGE_SIZE} />
      ) : isError ? (
        <ErrorState
          title="Failed to load documents"
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      ) : (
        <DocumentTable
          documents={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
