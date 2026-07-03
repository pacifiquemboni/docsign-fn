import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  organization_name: z.string().min(2).max(256),
  organization_slug: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/, 'Lowercase letters, numbers, and hyphens only'),
  first_name: z.string().min(1).max(128),
  last_name:  z.string().min(1).max(128),
  email:      z.string().email(),
  password:   z.string().min(8, 'At least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  // Auto-generate slug from organization name
  function handleOrgNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    register('organization_name').onChange(e);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setValue('organization_slug', slug);
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await authRegister(values);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setServerError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your workspace</h1>
        <p className="mt-1 text-sm text-gray-500">Start your free DocSign account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Org name */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Organization name</span>
          <input
            {...register('organization_name')}
            onChange={handleOrgNameChange}
            placeholder="Acme Corp"
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
          />
          {errors.organization_name && <p className="text-xs text-red-500">{errors.organization_name.message}</p>}
        </label>

        {/* Slug */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Workspace URL</span>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus-within:border-indigo-400">
            <span className="text-gray-400">docsign.app/</span>
            <input
              {...register('organization_slug')}
              className="flex-1 bg-transparent focus:outline-none"
              placeholder="acme-corp"
            />
          </div>
          {errors.organization_slug && <p className="text-xs text-red-500">{errors.organization_slug.message}</p>}
        </label>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">First name</span>
            <input
              {...register('first_name')}
              autoComplete="given-name"
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
            />
            {errors.first_name && <p className="text-xs text-red-500">Required</p>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Last name</span>
            <input
              {...register('last_name')}
              autoComplete="family-name"
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
        </div>

        {/* Email */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Work email</span>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </label>

        {/* Password */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </label>

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create workspace
        </button>

        <p className="text-center text-xs text-gray-400">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
