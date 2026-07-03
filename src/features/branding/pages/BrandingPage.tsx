import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { useUpdateBranding, useWorkspaceSettings } from '@/features/auth/hooks/useWorkspaceData';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  company_name:  z.string().max(256).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent_color:  z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logo_url:      z.string().url().or(z.literal('')).optional(),
  email_footer:  z.string().max(1000).optional(),
});
type FormValues = z.infer<typeof schema>;

export function BrandingPage() {
  const { showSuccess, showError } = useToast();
  const { organization } = useAuth();
  const { data: settings, isLoading } = useWorkspaceSettings();
  const updateMutation = useUpdateBranding();
  const [preview, setPreview] = useState({ primary: '#6366f1', accent: '#818cf8' });

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (organization || settings) {
      const branding = settings?.branding as Record<string, string> | null;
      reset({
        company_name:  branding?.company_name ?? organization?.name ?? '',
        primary_color: organization?.primary_color ?? '#6366f1',
        accent_color:  organization?.accent_color ?? '#818cf8',
        logo_url:      organization?.logo_url ?? '',
        email_footer:  branding?.email_footer ?? '',
      });
      setPreview({
        primary: organization?.primary_color ?? '#6366f1',
        accent:  organization?.accent_color ?? '#818cf8',
      });
    }
  }, [organization, settings, reset]);

  const primary = watch('primary_color');
  const accent  = watch('accent_color');

  async function onSubmit(values: FormValues) {
    try {
      await updateMutation.mutateAsync({
        company_name:  values.company_name || undefined,
        primary_color: values.primary_color || undefined,
        accent_color:  values.accent_color || undefined,
        logo_url:      values.logo_url || undefined,
        email_footer:  values.email_footer || undefined,
      });
      showSuccess('Branding updated');
      setPreview({ primary: values.primary_color ?? preview.primary, accent: values.accent_color ?? preview.accent });
    } catch (e) { showError((e as Error).message); }
  }

  if (isLoading) return <div className="flex h-48 items-center justify-center"><PageSpinner /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
        <p className="mt-1 text-sm text-gray-400">Customize how your workspace appears to signers</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Identity</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Company name</span>
                <input {...register('company_name')} placeholder="Acme Corp"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Logo URL</span>
                <input {...register('logo_url')} type="url" placeholder="https://…/logo.png"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Primary color</span>
                <div className="flex items-center gap-2">
                  <input {...register('primary_color')} type="color"
                    className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200" />
                  <input {...register('primary_color')} placeholder="#6366f1"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-mono focus:border-indigo-400 focus:outline-none" />
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Accent color</span>
                <div className="flex items-center gap-2">
                  <input {...register('accent_color')} type="color"
                    className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200" />
                  <input {...register('accent_color')} placeholder="#818cf8"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-mono focus:border-indigo-400 focus:outline-none" />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Email footer</h2>
            <textarea {...register('email_footer')} rows={3}
              placeholder="Your company address and legal boilerplate…"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
          </div>

          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save branding
          </button>
        </form>

        {/* Live preview */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live preview</p>
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 py-3" style={{ backgroundColor: primary ?? preview.primary }}>
              <p className="text-sm font-semibold text-white">{watch('company_name') || organization?.name || 'Your Company'}</p>
            </div>
            <div className="bg-white p-4">
              <p className="text-xs text-gray-500">Signing experience preview</p>
              <div className="mt-3 rounded-lg border-2 border-dashed p-4 text-center"
                style={{ borderColor: primary ?? preview.primary }}>
                <p className="text-xs text-gray-500">Signature field</p>
              </div>
              <button className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-white"
                style={{ backgroundColor: accent ?? preview.accent }}>
                Complete signing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
