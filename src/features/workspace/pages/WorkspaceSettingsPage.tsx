import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import { useUpdateWorkspaceSettings, useWorkspaceSettings } from '@/features/auth/hooks/useWorkspaceData';

const schema = z.object({
  default_expiry_days:           z.number().int().min(1).max(365),
  require_email_verification:    z.boolean(),
  allow_drawn_signatures:        z.boolean(),
  allow_typed_signatures:        z.boolean(),
  allow_uploaded_signatures:     z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function WorkspaceSettingsPage() {
  const { showSuccess, showError } = useToast();
  const { data: settings, isLoading } = useWorkspaceSettings();
  const updateMutation = useUpdateWorkspaceSettings();

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (settings) {
      reset({
        default_expiry_days:        settings.default_expiry_days,
        require_email_verification:  settings.require_email_verification,
        allow_drawn_signatures:      settings.allow_drawn_signatures,
        allow_typed_signatures:      settings.allow_typed_signatures,
        allow_uploaded_signatures:   settings.allow_uploaded_signatures,
      });
    }
  }, [settings, reset]);

  async function onSubmit(values: FormValues) {
    try {
      await updateMutation.mutateAsync(values);
      showSuccess('Settings saved');
    } catch (e) { showError((e as Error).message); }
  }

  if (isLoading) return <div className="flex h-48 items-center justify-center"><PageSpinner /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workspace settings</h1>
        <p className="mt-1 text-sm text-gray-400">Configure defaults for your entire organization</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Section title="Signing">
          <Field label="Default expiry (days)" hint="How long signing sessions remain open">
            <input
              {...register('default_expiry_days', { valueAsNumber: true })}
              type="number" min={1} max={365}
              className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
          </Field>

          <Toggle {...register('allow_drawn_signatures')}
            label="Allow drawn signatures"
            hint="Signers can draw their signature with a mouse or stylus" />
          <Toggle {...register('allow_typed_signatures')}
            label="Allow typed signatures"
            hint="Signers can type their name in a handwriting font" />
          <Toggle {...register('allow_uploaded_signatures')}
            label="Allow uploaded signatures"
            hint="Signers can upload an image of their signature" />
        </Section>

        <Section title="Security">
          <Toggle {...register('require_email_verification')}
            label="Require email verification"
            hint="New user accounts must verify their email before signing" />
        </Section>

        <button type="submit" disabled={isSubmitting}
          className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

// eslint-disable-next-line react/display-name
const Toggle = ({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4">
    <div>
      <p className="text-sm text-gray-700">{label}</p>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
    <input type="checkbox" {...props} className="h-4 w-4 rounded accent-indigo-600" />
  </label>
);
