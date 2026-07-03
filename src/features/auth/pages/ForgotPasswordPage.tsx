import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';

const schema = z.object({ email: z.string().email('Invalid email address') });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
        <p className="text-sm text-gray-500">
          If that email is registered, a reset link has been sent. It expires in 1 hour.
        </p>
        <Link to="/login" className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            {...register('email')}
            type="email"
            autoFocus
            placeholder="you@company.com"
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember it?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
