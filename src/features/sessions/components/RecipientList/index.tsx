import { useState } from 'react';
import { Edit2, Mail, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { RecipientStatusBadge } from '../RecipientStatusBadge';
import { RecipientDialog } from '../RecipientDialog';
import type { RecipientResponse, SessionStatus } from '../../types';

interface RecipientListProps {
  recipients: RecipientResponse[];
  sessionStatus: SessionStatus;
  isAddingRecipient: boolean;
  isUpdatingRecipient: boolean;
  isRemovingRecipient: boolean;
  isResending: boolean;
  onAdd: (values: { full_name: string; email: string; color: string; signing_order: number }) => void;
  onUpdate: (recipientId: string, values: { full_name?: string; email?: string; color?: string; signing_order?: number }) => void;
  onRemove: (recipientId: string) => void;
  onResend: (recipientId: string) => void;
}

const isDraft = (s: SessionStatus) => s === 'DRAFT';

export function RecipientList({
  recipients,
  sessionStatus,
  isAddingRecipient,
  isUpdatingRecipient,
  isRemovingRecipient,
  isResending,
  onAdd,
  onUpdate,
  onRemove,
  onResend,
}: RecipientListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecipientResponse | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  function handleSave(values: { full_name: string; email: string; color: string; signing_order: number }) {
    if (editing) {
      onUpdate(editing.id, values);
    } else {
      onAdd(values);
    }
    setDialogOpen(false);
    setEditing(null);
  }

  const nextOrder = recipients.length + 1;
  const canEdit = isDraft(sessionStatus);

  return (
    <div className="flex flex-col gap-3">
      {recipients.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          No recipients yet. Add the first one.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recipients.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              {/* Color chip + order */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-[10px] text-gray-400">#{r.signing_order}</span>
              </div>

              {/* Name & email */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{r.full_name}</p>
                <p className="truncate text-xs text-gray-400">{r.email}</p>
              </div>

              <RecipientStatusBadge status={r.status} />

              {/* Actions */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
                  aria-label="Actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {menuOpen === r.id && (
                  <div
                    className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
                    onMouseLeave={() => setMenuOpen(null)}
                  >
                    {canEdit && (
                      <>
                        <MenuBtn
                          icon={<Edit2 className="h-3.5 w-3.5" />}
                          label="Edit"
                          onClick={() => { setEditing(r); setDialogOpen(true); setMenuOpen(null); }}
                        />
                        <MenuBtn
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          label="Remove"
                          danger
                          disabled={isRemovingRecipient}
                          onClick={() => { onRemove(r.id); setMenuOpen(null); }}
                        />
                      </>
                    )}
                    {!canEdit && r.status !== 'SIGNED' && (
                      <MenuBtn
                        icon={<Mail className="h-3.5 w-3.5" />}
                        label="Resend invite"
                        disabled={isResending}
                        onClick={() => { onResend(r.id); setMenuOpen(null); }}
                      />
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <button
          type="button"
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="rounded-xl border border-dashed border-indigo-200 py-2.5 text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          + Add recipient
        </button>
      )}

      <RecipientDialog
        open={dialogOpen}
        editing={editing}
        nextOrder={nextOrder}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSave={handleSave}
        isSaving={isAddingRecipient || isUpdatingRecipient}
      />
    </div>
  );
}

function MenuBtn({
  icon, label, onClick, danger = false, disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors disabled:opacity-40',
        danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
