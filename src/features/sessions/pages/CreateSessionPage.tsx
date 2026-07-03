import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useDocument } from '@/features/documents/hooks/useDocument';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { useCreateSession } from '../hooks/useSessionMutations';
import type { SigningOrderMode } from '../types';

const schema = z.object({
  title:            z.string().min(1, 'Title is required').max(256),
  message:          z.string().max(4000).optional(),
  signing_order:    z.enum(['PARALLEL', 'SEQUENTIAL']),
  expires_in_days:  z.number().int().min(1).max(365).optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();

  const { data: docRes, isLoading } = useDocument(id);
  const document = docRes?.data;

  const createSession = useCreateSession(id!);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { signing_order: 'PARALLEL' },
  });

  const signingOrder = watch('signing_order');

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center"><PageSpinner /></div>
  );

  function onSubmit(values: FormValues) {
    createSession.mutate(
      {
        title:           values.title,
        message:         values.message || undefined,
        signing_order:   values.signing_order as SigningOrderMode,
        expires_in_days: values.expires_in_days,
      },
      {
        onSuccess: (res) => {
          if (res.data) navigate(`/sessions/${res.data.id}`);
        },
        onError: (e) => showError(e.message),
      },
    );
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/documents/${id}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to document
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Request signatures</h1>
        {document && (
          <p className="mt-1 text-sm text-gray-400 truncate">{document.original_name}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {/* Title */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Session title <span className="text-red-400">*</span></span>
          <input
            {...register('title')}
            placeholder={document ? `Sign: ${document.original_name}` : 'Document signing request'}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </label>

        {/* Message */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Message to signers</span>
          <textarea
            {...register('message')}
            rows={3}
            placeholder="Please review and sign the attached document at your earliest convenience."
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-indigo-400 focus:outline-none"
          />
        </label>

        {/* Signing order */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Signing order</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['PARALLEL', 'SEQUENTIAL'] as const).map((mode) => (
              <label
                key={mode}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 transition-colors ${
                  signingOrder === mode ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={mode}
                  {...register('signing_order')}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-gray-800">
                  {mode === 'PARALLEL' ? 'All at once' : 'One by one'}
                </span>
                <span className="text-xs text-gray-400">
                  {mode === 'PARALLEL'
                    ? 'All recipients receive invitations simultaneously'
                    : 'Recipients sign in the order you specify'}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Expiry */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Expires in (days)</span>
          <input
            {...register('expires_in_days', { valueAsNumber: true })}
            type="number"
            min={1} max={365}
            placeholder="30"
            className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
          <p className="text-xs text-gray-400">Leave blank for no expiration.</p>
        </label>

        <button
          type="submit"
          disabled={createSession.isPending}
          className="rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          {createSession.isPending ? 'Creating…' : 'Create session & add recipients →'}
        </button>
      </form>
    </div>
  );
}
