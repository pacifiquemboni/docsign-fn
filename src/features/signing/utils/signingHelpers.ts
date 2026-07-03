import type { DocumentField } from '@/features/editor/types';
import type { FieldCompletion, FieldCompletions } from '../types';

/** Fields the signer must complete before finishing. */
export function getRequiredFields(fields: DocumentField[]): DocumentField[] {
  return fields.filter((f) => f.required && f.visible);
}

/** Required fields that haven't been completed yet. */
export function getIncompleteRequired(
  fields: DocumentField[],
  completions: FieldCompletions,
): DocumentField[] {
  return getRequiredFields(fields).filter((f) => !isFieldCompleted(f.id, completions));
}

export function isFieldCompleted(fieldId: string, completions: FieldCompletions): boolean {
  const c = completions[fieldId];
  if (!c) return false;
  if (c.kind === 'checkbox') return true; // checkbox completion = toggled at least once
  if (c.kind === 'text') return c.value.trim().length > 0;
  if (c.kind === 'date') return c.value.length > 0;
  return true; // signature
}

export function getCompletionSummary(
  fields: DocumentField[],
  completions: FieldCompletions,
): { required: number; completed: number; total: number; allRequiredDone: boolean } {
  const required = getRequiredFields(fields);
  const completed = required.filter((f) => isFieldCompleted(f.id, completions)).length;
  return {
    required: required.length,
    completed,
    total: fields.length,
    allRequiredDone: completed === required.length,
  };
}

/** ISO date string for today, e.g. "2026-07-01". */
export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

/** Display-friendly date, e.g. "July 1, 2026". */
export function formatDisplayDate(isoDate: string): string {
  try {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/** Trigger a browser download from a Blob. */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Completion object accessor — null if not completed. */
export function getCompletion(
  fieldId: string,
  completions: FieldCompletions,
): FieldCompletion | null {
  return completions[fieldId] ?? null;
}
