import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Copy, Key, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/features/auth/hooks/useWorkspaceData';
import type { ApiKeyCreatedResponse } from '@/features/auth/types';

const schema = z.object({
  name:            z.string().min(1).max(128),
  expires_in_days: z.number().int().min(1).max(3650).optional(),
});
type FormValues = z.infer<typeof schema>;

export function ApiKeysPage() {
  const { showSuccess, showError } = useToast();
  const [showCreate, setShowCreate]       = useState(false);
  const [createdKey, setCreatedKey]       = useState<ApiKeyCreatedResponse | null>(null);
  const [copied, setCopied]               = useState(false);

  const { data: keys = [], isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onCreate(values: FormValues) {
    try {
      const res = await createMutation.mutateAsync({
        name: values.name,
        expires_in_days: values.expires_in_days,
      });
      if (res.data) {
        setCreatedKey(res.data);
        setShowCreate(false);
        reset();
      }
    } catch (e) { showError((e as Error).message); }
  }

  async function handleRevoke(keyId: string) {
    try {
      await revokeMutation.mutateAsync(keyId);
      showSuccess('API key revoked');
    } catch (e) { showError((e as Error).message); }
  }

  function handleCopy() {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey.raw_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) return <div className="flex h-48 items-center justify-center"><PageSpinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-1 text-sm text-gray-400">Programmatic access to your workspace</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          New API key
        </button>
      </div>

      {/* One-time reveal banner */}
      {createdKey && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-emerald-800">API key created — copy it now</p>
              <p className="mt-0.5 text-xs text-emerald-700">This key will never be shown again.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-white px-3 py-1.5 text-xs font-mono text-gray-800 shadow-sm">
                  {createdKey.raw_key}
                </code>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => setCreatedKey(null)} className="text-emerald-500 hover:text-emerald-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key list */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {keys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Key className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No API keys yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Last used</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{k.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      k.revoked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {k.revoked ? 'Revoked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    {!k.revoked && (
                      <button onClick={() => handleRevoke(k.id)} disabled={revokeMutation.isPending}
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onCreate)}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Create API key</h2>
              <button type="button" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Key name <span className="text-red-400">*</span></span>
                <input {...register('name')} placeholder="e.g. CI/CD Pipeline"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" autoFocus />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Expires in (days)</span>
                <input {...register('expires_in_days', { valueAsNumber: true })} type="number" min={1} max={3650} placeholder="Never"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              </label>
            </div>

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
