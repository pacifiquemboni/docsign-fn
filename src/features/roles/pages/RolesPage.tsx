import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Shield, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/common/LoadingSpinner';
import {
  useCreateRole,
  useDeleteRole,
  usePermissions,
  useRoles,
  useUpdateRole,
} from '@/features/auth/hooks/useWorkspaceData';
import type { RoleResponse } from '@/features/auth/types';

const schema = z.object({
  name:             z.string().min(1).max(64),
  description:      z.string().max(256).optional(),
  permission_codes: z.array(z.string()),
});
type FormValues = z.infer<typeof schema>;

export function RolesPage() {
  const { showSuccess, showError } = useToast();
  const [dialogRole, setDialogRole] = useState<RoleResponse | null | 'new'>(null);

  const { data: roles = [], isLoading }   = useRoles();
  const { data: permissions = [] }         = usePermissions();
  const createMutation  = useCreateRole();
  const updateMutation  = useUpdateRole();
  const deleteMutation  = useDeleteRole();

  // Group permissions by resource
  const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
    (acc[p.resource] ??= []).push(p);
    return acc;
  }, {});

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { permission_codes: [] } });

  function openNew() {
    reset({ name: '', description: '', permission_codes: [] });
    setDialogRole('new');
  }

  function openEdit(role: RoleResponse) {
    reset({ name: role.name, description: role.description ?? '', permission_codes: role.permissions });
    setDialogRole(role);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (dialogRole === 'new') {
        await createMutation.mutateAsync(values);
        showSuccess('Role created');
      } else if (dialogRole) {
        await updateMutation.mutateAsync({ roleId: (dialogRole as RoleResponse).id, payload: values });
        showSuccess('Role updated');
      }
      setDialogRole(null);
    } catch (e) { showError((e as Error).message); }
  }

  async function handleDelete(role: RoleResponse) {
    if (role.is_system) return;
    try {
      await deleteMutation.mutateAsync(role.id);
      showSuccess('Role deleted');
    } catch (e) { showError((e as Error).message); }
  }

  if (isLoading) return <div className="flex h-48 items-center justify-center"><PageSpinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="mt-1 text-sm text-gray-400">Manage who can do what in your workspace</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          New role
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-200 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 shrink-0 text-indigo-500" />
                <p className="text-sm font-semibold text-gray-900">{role.name}</p>
                {role.is_system && (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">System</span>
                )}
              </div>
              {!role.is_system && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(role)}
                    className="rounded px-2 py-0.5 text-xs text-indigo-500 hover:bg-indigo-50">Edit</button>
                  <button onClick={() => handleDelete(role)} disabled={deleteMutation.isPending}
                    className="rounded px-2 py-0.5 text-xs text-red-400 hover:bg-red-50">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 5).map((p) => (
                <span key={p} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">{p}</span>
              ))}
              {role.permissions.length > 5 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">+{role.permissions.length - 5} more</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role dialog */}
      {dialogRole !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setDialogRole(null)}>
          <form onSubmit={handleSubmit(onSubmit)}
            className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {dialogRole === 'new' ? 'New role' : `Edit: ${(dialogRole as RoleResponse).name}`}
              </h2>
              <button type="button" onClick={() => setDialogRole(null)}>
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-700">Name</span>
              <input {...register('name')}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-700">Description</span>
              <input {...register('description')}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
            </label>

            {/* Permissions grouped by resource */}
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Permissions</p>
              <Controller
                control={control}
                name="permission_codes"
                render={({ field }) => (
                  <>
                    {Object.entries(grouped).map(([resource, perms]) => (
                      <div key={resource}>
                        <p className="mb-1.5 text-xs font-medium text-gray-700 capitalize">{resource}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {perms.map((p) => (
                            <label key={p.code} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.value.includes(p.code)}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...field.value, p.code]
                                    : field.value.filter((c) => c !== p.code);
                                  field.onChange(next);
                                }}
                                className="h-3.5 w-3.5 rounded accent-indigo-600"
                              />
                              {p.code}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setDialogRole(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save role
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
