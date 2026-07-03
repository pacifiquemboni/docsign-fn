import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PenLine } from 'lucide-react';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { useDocumentSessions } from '../hooks/useDocumentSessions';
import { SessionCard } from '../components/SessionCard';

export function SessionDashboard() {
  const navigate = useNavigate();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { data: docsRes, isLoading: docsLoading } = useDocuments({ skip: 0, limit: 50 });
  const documents = docsRes?.data ?? [];

  const { data: sessions = [], isLoading: sessionsLoading } = useDocumentSessions(
    selectedDocId ?? undefined,
  );

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signing Sessions</h1>
          <p className="mt-1 text-sm text-gray-400">
            Request and track document signatures.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document selector */}
        <aside className="flex flex-col gap-3 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Select document
          </p>

          {docsLoading ? (
            <div className="flex justify-center py-8"><PageSpinner /></div>
          ) : documents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
              No documents uploaded yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedDocId === doc.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{doc.original_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Sessions for selected document */}
        <main className="flex flex-col gap-3 lg:col-span-2">
          {!selectedDocId ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
              <PenLine className="mb-3 h-8 w-8 text-gray-300" />
              <p>Select a document to view or create signing sessions.</p>
            </div>
          ) : sessionsLoading ? (
            <div className="flex justify-center py-12"><PageSpinner /></div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {sessions.length === 0 ? 'No sessions yet' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/documents/${selectedDocId}/session`)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  + New session
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
                  <PenLine className="mb-3 h-7 w-7 text-gray-300" />
                  <p className="text-sm text-gray-400">No signing sessions for this document.</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/documents/${selectedDocId}/session`)}
                    className="mt-3 text-sm font-medium text-indigo-500 hover:text-indigo-700"
                  >
                    Create the first session →
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {sessions.map((s) => (
                    <li key={s.id}>
                      <SessionCard session={s} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
