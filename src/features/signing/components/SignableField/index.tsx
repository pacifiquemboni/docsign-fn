import { memo, useRef, useEffect } from 'react';
import { CheckCircle2, PenLine, Pen, Calendar, Type, Square, SquareCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { pdfPointsToPixels } from '@/features/editor/utils/coordinates';
import { getSignatureImageUrl } from '../../api/signingApi';
import { isFieldCompleted } from '../../utils/signingHelpers';
import type { DocumentField } from '@/features/editor/types';
import type { FieldCompletion, FieldCompletions } from '../../types';

interface SignableFieldProps {
  field: DocumentField;
  completions: FieldCompletions;
  canvasHeight: number;
  zoom: number;
  isActiveText: boolean;
  onClick: () => void;
  onTextCommit: (value: string) => void;
}

export const SignableField = memo(function SignableField({
  field,
  completions,
  canvasHeight,
  zoom,
  isActiveText,
  onClick,
  onTextCommit,
}: SignableFieldProps) {
  const px = pdfPointsToPixels(field, canvasHeight, zoom);
  const completion = completions[field.id] as FieldCompletion | undefined;
  const completed = isFieldCompleted(field.id, completions);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActiveText) inputRef.current?.focus();
  }, [isActiveText]);

  const isRequired = field.required;

  const outline =
    completed
      ? 'ring-2 ring-emerald-400'
      : isRequired
      ? 'ring-2 ring-indigo-400'
      : 'ring-1 ring-gray-300';

  return (
    <div
      style={{
        position: 'absolute',
        left: px.left,
        top: px.top,
        width: px.width,
        height: px.height,
        zIndex: 2,
      }}
      className={cn('rounded', outline)}
    >
      {/* Required badge */}
      {isRequired && !completed && (
        <span className="pointer-events-none absolute -top-3.5 left-0 flex items-center gap-0.5 rounded-t-sm bg-indigo-500 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
          Required
        </span>
      )}

      {/* Completed check */}
      {completed && (
        <span className="pointer-events-none absolute -top-3 right-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-white" />
        </span>
      )}

      <FieldContent
        field={field}
        completion={completion}
        completed={completed}
        isActiveText={isActiveText}
        inputRef={inputRef}
        onClick={onClick}
        onTextCommit={onTextCommit}
        px={px}
      />
    </div>
  );
});

// ── Inner content dispatcher ───────────────────────────────────────────────────

function FieldContent({
  field,
  completion,
  completed,
  isActiveText,
  inputRef,
  onClick,
  onTextCommit,
  px,
}: {
  field: DocumentField;
  completion: FieldCompletion | undefined;
  completed: boolean;
  isActiveText: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClick: () => void;
  onTextCommit: (v: string) => void;
  px: { width: number; height: number };
}) {
  const t = field.field_type;

  if (t === 'SIGNATURE' || t === 'INITIAL') {
    if (completion?.kind === 'signature') {
      return (
        <button
          type="button"
          onClick={onClick}
          className="h-full w-full rounded"
          aria-label={`${t} signed — click to change`}
        >
          <img
            src={getSignatureImageUrl(completion.signature_id)}
            alt="Applied signature"
            className="h-full w-full object-contain p-0.5"
          />
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex h-full w-full items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors',
          'bg-indigo-50 text-indigo-500 hover:bg-indigo-100',
        )}
        aria-label={t === 'SIGNATURE' ? 'Click to sign' : 'Click to add initials'}
      >
        {t === 'SIGNATURE' ? (
          <PenLine className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <Pen className="h-3.5 w-3.5 shrink-0" />
        )}
        {px.width > 80 && (
          <span>{t === 'SIGNATURE' ? 'Click to Sign' : 'Click to Initial'}</span>
        )}
      </button>
    );
  }

  if (t === 'CHECKBOX') {
    const checked = completion?.kind === 'checkbox' ? completion.checked : false;
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full items-center justify-center rounded hover:bg-gray-50 transition-colors"
        aria-label={checked ? 'Uncheck' : 'Check'}
        aria-checked={checked}
        role="checkbox"
      >
        {checked ? (
          <SquareCheck className="h-5 w-5 text-indigo-600" />
        ) : (
          <Square className="h-5 w-5 text-gray-400" />
        )}
      </button>
    );
  }

  if (t === 'DATE') {
    const value = completion?.kind === 'date' ? completion.value : '';
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex h-full w-full items-center gap-1.5 rounded px-2 text-xs transition-colors',
          completed ? 'text-gray-800' : 'text-gray-400 hover:bg-amber-50',
        )}
        aria-label="Date field"
      >
        <Calendar className="h-3 w-3 shrink-0" />
        <span className="truncate">{value || 'Click to set date'}</span>
      </button>
    );
  }

  // TEXT
  if (isActiveText) {
    const current = completion?.kind === 'text' ? completion.value : '';
    return (
      <input
        ref={inputRef}
        type="text"
        defaultValue={current}
        placeholder={field.placeholder ?? 'Enter text…'}
        maxLength={500}
        onBlur={(e) => onTextCommit(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
        className="h-full w-full rounded bg-white px-2 py-0.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
        aria-label={field.label ?? 'Text field'}
      />
    );
  }

  const textValue = completion?.kind === 'text' ? completion.value : '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-full w-full items-center gap-1.5 rounded px-2 text-xs text-left transition-colors',
        completed ? 'text-gray-800' : 'text-gray-400 hover:bg-sky-50',
      )}
      aria-label={field.label ?? 'Text field'}
    >
      <Type className="h-3 w-3 shrink-0" />
      <span className="truncate">{textValue || field.placeholder || 'Click to type…'}</span>
    </button>
  );
}
