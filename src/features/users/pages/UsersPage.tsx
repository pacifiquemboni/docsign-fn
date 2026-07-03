import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MoreVertical, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import {
  useAssignRole,
  useDeactivateUser,
  useInviteUser,
  useRoles,
  useUsers,
} from '@/features/auth/hooks/useWorkspaceData';
import { fullName, type UserResponse } from '@/features/auth/types';

const inviteSchema = z.object({
  email:      z.string().email('Invalid email'),
  role_id:    z.string().uuid('Select a role'),
  first_name: z.string().optional(),
  last_name:  z.string().optional(),
});
type InviteForm = z.infer<typeof inviteSchema>;

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:   'bg-emerald-100 text-emerald-700',
  INVITED:  'bg-amber-100 text-amber-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
};

export function UsersPage() {
  const { user: me } = useAuth();
  const { showSuccess, showError } = useToast();
  const [showInvite, setShowInvite] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] }            = useRoles();
  const inviteMutation      = useInviteUser();
  const deactivateMutation  = useDeactivateUser();
  const assignRoleMutation  = useAssignRole();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

  async function handleInvite(values: InviteForm) {
    try {
      await inviteMutation.mutateAsync(values);
      showSuccess(`Invitation sent to ${values.email}`);
      setShowInvite(false);
      reset();
    } catch (e) { showError((e as Error).message); }
  }

  async function handleDeactivate(userId: string) {
    try {
      await deactivateMutation.mutateAsync(userId);
      showSuccess('User deactivated');
    } catch (e) { showError((e as Error).message); }
    setMenuOpen(null);
  }

  if (isLoading) return <div className="flex h-48 items-center justify-center"><PageSpinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-400">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite user
        </button>
      </div>

      {/* User table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u: UserResponse) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {(u.first_name?.[0] ?? u.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{fullName(u)}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {u.role ?? '—'}
                  {u.id !== me?.id && (
                    <select
                      className="ml-2 rounded border border-gray-200 bg-transparent text-xs text-gray-500 focus:outline-none"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          assignRoleMutation.mutate({ userId: u.id, roleId: e.target.value }, {
                            onSuccess: () => showSuccess('Role updated'),
                            onError: (err) => showError(err.message),
                          });
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Change…</option>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLOR[u.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="relative px-2 py-3">
                  {u.id !== me?.id && (
                    <>
                      <button
                        onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuOpen === u.id && (
                        <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-gray-100 bg-white shadow-lg">
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                          >
                            Deactivate
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">No users yet. Invite someone.</p>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit(handleInvite)}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Invite user</h2>
              <button type="button" onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Email address <span className="text-red-400">*</span></span>
                <input {...register('email')} type="email" placeholder="colleague@company.com"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">Role <span className="text-red-400">*</span></span>
                <select {...register('role_id')}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none">
                  <option value="">Select role…</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {errors.role_id && <p className="text-xs text-red-500">{errors.role_id.message}</p>}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-700">First name</span>
                  <input {...register('first_name')} placeholder="Jane"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-700">Last name</span>
                  <input {...register('last_name')} placeholder="Smith"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowInvite(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
