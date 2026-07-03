import type { DocumentField } from '../../types';
import { SignatureField } from '../SignatureField';
import { InitialField } from '../InitialField';
import { TextField } from '../TextField';
import { DateField } from '../DateField';
import { CheckboxField } from '../CheckboxField';

interface FieldRendererProps {
  field: DocumentField;
  selected: boolean;
}

/** Generic renderer — switch on field type and delegate to the correct component.
 *  Adding a new field type only requires a new case here and a new component. */
export function FieldRenderer({ field, selected }: FieldRendererProps) {
  switch (field.field_type) {
    case 'SIGNATURE':
      return <SignatureField field={field} selected={selected} />;
    case 'INITIAL':
      return <InitialField field={field} selected={selected} />;
    case 'TEXT':
      return <TextField field={field} selected={selected} />;
    case 'DATE':
      return <DateField field={field} selected={selected} />;
    case 'CHECKBOX':
      return <CheckboxField field={field} selected={selected} />;
    default:
      return null;
  }
}
