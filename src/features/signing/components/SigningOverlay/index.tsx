import type { DocumentField } from '@/features/editor/types';
import type { FieldCompletions } from '../../types';
import { SignableField } from '../SignableField';

interface SigningOverlayProps {
  fields: DocumentField[];
  completions: FieldCompletions;
  canvasHeight: number;
  zoom: number;
  activeTextField: string | null;
  onFieldClick: (field: DocumentField) => void;
  onTextCommit: (fieldId: string, value: string) => void;
}

export function SigningOverlay({
  fields,
  completions,
  canvasHeight,
  zoom,
  activeTextField,
  onFieldClick,
  onTextCommit,
}: SigningOverlayProps) {
  return (
    <div className="pointer-events-auto absolute inset-0" style={{ zIndex: 5 }}>
      {fields.map((field) => (
        <SignableField
          key={field.id}
          field={field}
          completions={completions}
          canvasHeight={canvasHeight}
          zoom={zoom}
          isActiveText={activeTextField === field.id}
          onClick={() => onFieldClick(field)}
          onTextCommit={(value) => onTextCommit(field.id, value)}
        />
      ))}
    </div>
  );
}
