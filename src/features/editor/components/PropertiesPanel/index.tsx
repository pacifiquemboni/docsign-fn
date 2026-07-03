import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Unlock, X } from 'lucide-react';
import type { DocumentField, UpdateFieldPayload } from '../../types';

interface PropertiesPanelProps {
  field: DocumentField | null;
  isUpdating: boolean;
  isLocking: boolean;
  onClose: () => void;
  onUpdate: (fieldId: string, payload: UpdateFieldPayload) => void;
  onToggleLock: (fieldId: string) => void;
}

interface FormValues {
  label: string;
  required: boolean;
  placeholder: string;
}

export function PropertiesPanel({
  field,
  isUpdating,
  isLocking,
  onClose,
  onUpdate,
  onToggleLock,
}: PropertiesPanelProps) {
  const { register, reset, handleSubmit } = useForm<FormValues>();

  useEffect(() => {
    if (field) {
      reset({
        label:       field.label ?? '',
        required:    field.required,
        placeholder: field.placeholder ?? '',
      });
    }
  }, [field?.id, reset]);

  if (!field) {
    return (
      <aside className="flex w-56 shrink-0 flex-col items-center justify-center gap-2 border-l border-gray-200 bg-white p-6 text-center">
        <p className="text-xs text-gray-400">
          Select a field to edit its properties
        </p>
      </aside>
    );
  }

  function submit(values: FormValues) {
    if (!field) return;
    onUpdate(field.id, {
      label:       values.label       || undefined,
      required:    values.required,
      placeholder: values.placeholder || undefined,
    });
  }

  const showPlaceholder = field.field_type === 'TEXT' || field.field_type === 'DATE';

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Properties
        </h2>
        <button
          aria-label="Close properties"
          onClick={onClose}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <form
        onBlur={handleSubmit(submit)}
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3"
      >
        {/* Label */}
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-500">Label</span>
          <input
            {...register('label')}
            disabled={isUpdating || field.locked}
            className="rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none disabled:opacity-50"
            placeholder="Field label"
          />
        </label>

        {/* Placeholder (text / date only) */}
        {showPlaceholder && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500">Placeholder</span>
            <input
              {...register('placeholder')}
              disabled={isUpdating || field.locked}
              className="rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none disabled:opacity-50"
              placeholder="Enter placeholder text"
            />
          </label>
        )}

        {/* Required */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('required')}
            disabled={isUpdating || field.locked}
            className="h-3.5 w-3.5 rounded border-gray-300 accent-indigo-600 disabled:opacity-50"
          />
          <span className="text-xs text-gray-700">Required</span>
        </label>
      </form>

      {/* Position / size (read-only info) */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Position
        </p>
        <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-600">
          <span className="text-gray-400">X</span>
          <span>{field.x.toFixed(0)} pt</span>
          <span className="text-gray-400">Y</span>
          <span>{field.y.toFixed(0)} pt</span>
          <span className="text-gray-400">W</span>
          <span>{field.width.toFixed(0)} pt</span>
          <span className="text-gray-400">H</span>
          <span>{field.height.toFixed(0)} pt</span>
        </div>
      </div>

      {/* Lock / Unlock */}
      <button
        disabled={isLocking}
        onClick={() => onToggleLock(field.id)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
      >
        {field.locked ? (
          <>
            <Unlock className="h-3.5 w-3.5 text-amber-500" />
            Unlock field
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" />
            Lock field
          </>
        )}
      </button>
    </aside>
  );
}
