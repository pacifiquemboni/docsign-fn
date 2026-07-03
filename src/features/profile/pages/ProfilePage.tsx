import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/features/auth/api/authApi';
import { usersApi } from '@/features/auth/api/authApi';
import { fullName } from '@/features/auth/types';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required').max(128),
  last_name:  z.string().max(128).optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Required'),
  new_password:     z.string().min(8, 'At least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type ProfileForm   = z.infer<typeof profileSchema>;
type PasswordForm  = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const pf = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user?.first_name ?? '', last_name: user?.last_name ?? '' },
  });
  const pwf = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function onProfileSave(values: ProfileForm) {
    if (!user) return;
    try {
      await usersApi.update(user.id, values);
      await refreshUser();
      showSuccess('Profile updated');
    } catch (e) { showError((e as Error).message); }
  }

  async function onPasswordChange(values: PasswordForm) {
    try {
      await authApi.changePassword(values.current_password, values.new_password);
      showSuccess('Password changed');
      pwf.reset();
    } catch (e) { showError((e as Error).message); }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your personal account settings</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
          {(user.first_name?.[0] ?? user.email[0]).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{fullName(user)}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
            {user.role ?? 'Member'}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={pf.handleSubmit(onProfileSave)}
        className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Personal information</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-700">First name</span>
            <input {...pf.register('first_name')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
            {pf.formState.errors.first_name && (
              <p className="text-xs text-red-500">{pf.formState.errors.first_name.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-700">Last name</span>
            <input {...pf.register('last_name')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-700">Email (read-only)</span>
          <input value={user.email} readOnly
            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500" />
        </label>
        <button type="submit" disabled={pf.formState.isSubmitting}
          className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
          {pf.formState.isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <Save className="h-3.5 w-3.5" />
          Save changes
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={pwf.handleSubmit(onPasswordChange)}
        className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
        {(['current_password', 'new_password', 'confirm_password'] as const).map((field) => (
          <label key={field} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-700 capitalize">
              {field.replace(/_/g, ' ')}
            </span>
            <input {...pwf.register(field)} type="password"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
            {pwf.formState.errors[field] && (
              <p className="text-xs text-red-500">{pwf.formState.errors[field]!.message}</p>
            )}
          </label>
        ))}
        <button type="submit" disabled={pwf.formState.isSubmitting}
          className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
          {pwf.formState.isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Update password
        </button>
      </form>
    </div>
  );
}
