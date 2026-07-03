import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { RecipientColorPicker } from '../RecipientColorPicker';
import { RECIPIENT_COLORS } from '../../types';
import type { RecipientResponse } from '../../types';

const schema = z.object({
  full_name:     z.string().min(1, 'Name is required').max(256),
  email:         z.string().email('Invalid email address'),
  color:         z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  signing_order: z.number().int().min(1).max(100),
});

type FormValues = z.infer<typeof schema>;

interface RecipientDialogProps {
  open: boolean;
  editing: RecipientResponse | null;
  nextOrder: number;
  onClose: () => void;
  onSave: (values: FormValues) => void;
  isSaving: boolean;
}

export function RecipientDialog({
  open,
  editing,
  nextOrder,
  onClose,
  onSave,
  isSaving,
}: RecipientDialogProps) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        full_name: '',
        email: '',
        color: RECIPIENT_COLORS[0],
        signing_order: nextOrder,
      },
    });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? { full_name: editing.full_name, email: editing.email, color: editing.color, signing_order: editing.signing_order }
          : { full_name: '', email: '', color: RECIPIENT_COLORS[0], signing_order: nextOrder },
      );
    }
  }, [open, editing, nextOrder, reset]);

  if (!open) return null;

  const color = watch('color');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog" aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit(onSave)}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {editing ? 'Edit recipient' : 'Add recipient'}
          </h2>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Full name</span>
            <input
              {...register('full_name')}
              placeholder="Jane Smith"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Email address</span>
            <input
              {...register('email')}
              type="email"
              placeholder="jane@example.com"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Signing order</span>
            <input
              {...register('signing_order', { valueAsNumber: true })}
              type="number" min={1} max={100}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Color</span>
            <RecipientColorPicker value={color} onChange={(c) => setValue('color', c)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Add recipient'}
          </button>
        </div>
      </form>
    </div>
  );
}
