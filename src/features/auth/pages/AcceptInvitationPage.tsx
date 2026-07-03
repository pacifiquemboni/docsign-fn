import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import { tokenManager } from '@/services/tokenManager';

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  password:   z.string().min(8, 'At least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!token) return;
    setError(null);
    try {
      const res = await authApi.acceptInvitation(
        token,
        values.first_name,
        values.last_name,
        values.password,
      );
      if (res.data) {
        tokenManager.setAccessToken(res.data.access_token, res.data.expires_in);
        tokenManager.setRefreshToken(res.data.refresh_token);
        navigate('/dashboard', { replace: true });
        window.location.reload(); // reload so AuthProvider picks up the new tokens
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accept invitation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set your name and password to join the workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">First name</span>
            <input
              {...register('first_name')}
              autoFocus
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
            />
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Last name</span>
            <input
              {...register('last_name')}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Choose a password</span>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Join workspace
        </button>
      </form>
    </div>
  );
}
