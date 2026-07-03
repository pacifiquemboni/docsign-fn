import { useState, useMemo } from 'react';
import { Save, Users } from 'lucide-react';
import { useDocumentFields } from '@/features/editor/hooks/useDocumentFields';
import type { RecipientResponse, FieldAssignmentMap } from '../../types';

interface FieldAssignmentPanelProps {
  documentId: string;
  recipients: RecipientResponse[];
  onSave: (assignments: FieldAssignmentMap) => void;
  isSaving: boolean;
}

const FIELD_TYPE_LABEL: Record<string, string> = {
  SIGNATURE: 'Signature',
  INITIAL: 'Initial',
  TEXT: 'Text',
  DATE: 'Date',
  CHECKBOX: 'Checkbox',
};

export function FieldAssignmentPanel({
  documentId,
  recipients,
  onSave,
  isSaving,
}: FieldAssignmentPanelProps) {
  const { data: fieldsRes } = useDocumentFields(documentId);
  const fields = fieldsRes?.data ?? [];

  // Initialize from existing field.recipient_id values that match a known recipient
  const knownRecipientIds = useMemo(() => new Set(recipients.map((r) => r.id)), [recipients]);

  const initialMap = useMemo<FieldAssignmentMap>(() => {
    const m: FieldAssignmentMap = {};
    for (const f of fields) {
      if (f.recipient_id && knownRecipientIds.has(f.recipient_id)) {
        m[f.id] = f.recipient_id;
      }
    }
    return m;
  }, [fields, knownRecipientIds]);

  const [assignments, setAssignments] = useState<FieldAssignmentMap>(initialMap);

  const recipientMap = useMemo(
    () => Object.fromEntries(recipients.map((r) => [r.id, r])),
    [recipients],
  );

  function assign(fieldId: string, recipientId: string) {
    setAssignments((prev) => ({
      ...prev,
      [fieldId]: recipientId || '',
    }));
  }

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        <Users className="h-8 w-8 text-gray-300" />
        <p>No fields placed in the document yet.</p>
        <p className="text-xs">Open the editor to add signature fields first.</p>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
        Add at least one recipient before assigning fields.
      </p>
    );
  }

  const grouped = fields.reduce<Record<number, typeof fields>>((acc, f) => {
    (acc[f.page_number] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([page, pageFields]) => (
        <div key={page}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Page {page}
          </p>
          <div className="flex flex-col gap-2">
            {pageFields.map((field) => {
              const assignedId = assignments[field.id] ?? '';
              const assignedRecipient = assignedId ? recipientMap[assignedId] : null;
              return (
                <div
                  key={field.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                  style={assignedRecipient ? { borderLeftColor: assignedRecipient.color, borderLeftWidth: 3 } : {}}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-700">
                      {FIELD_TYPE_LABEL[field.field_type] ?? field.field_type}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {field.label ?? 'Unlabeled field'}
                    </p>
                  </div>

                  <select
                    value={assignedId}
                    onChange={(e) => assign(field.id, e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none"
                    aria-label={`Assign ${field.field_type} field to recipient`}
                  >
                    <option value="">— Unassigned —</option>
                    {recipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onSave(assignments)}
        disabled={isSaving}
        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        <Save className="h-3.5 w-3.5" />
        {isSaving ? 'Saving assignments…' : 'Save field assignments'}
      </button>
    </div>
  );
}
