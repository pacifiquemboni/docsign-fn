import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { useDeleteDocument } from '../hooks/useDeleteDocument';
import { useDownloadDocument } from '../hooks/useDownloadDocument';
import { formatDate, formatFileSize, truncateFilename } from '@/utils/formatters';
import type { Document } from '../types';

const PAGE_SIZE = 10;

interface DocumentTableProps {
  documents: Document[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function DocumentTable({
  documents,
  total,
  page,
  onPageChange,
}: DocumentTableProps) {
  const navigate = useNavigate();
  const { download, downloading } = useDownloadDocument();
  const deleteMutation = useDeleteDocument();

  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Upload your first PDF to get started."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Status', 'Pages', 'Size', 'Uploaded', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="group cursor-pointer transition-colors hover:bg-gray-50/60"
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
                    {doc.page_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(doc.created_at)}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Download className="h-3.5 w-3.5" />}
                        loading={downloading}
                        onClick={() => download(doc.id, doc.original_name)}
                        aria-label={`Download ${doc.original_name}`}
                      >
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                        onClick={() => setDeleteTarget(doc)}
                        aria-label={`Delete ${doc.original_name}`}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft className="h-4 w-4" />}
                disabled={!hasPrev}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
              />
              <span className="px-2 text-xs font-medium text-gray-700">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight className="h-4 w-4" />}
                disabled={!hasNext}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete document"
        description={`"${deleteTarget?.original_name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
