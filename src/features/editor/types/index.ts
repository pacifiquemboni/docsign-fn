export type FieldType = 'SIGNATURE' | 'INITIAL' | 'TEXT' | 'DATE' | 'CHECKBOX';

export interface DocumentField {
  id: string;
  document_id: string;
  field_type: FieldType;
  page_number: number;
  /** Left edge, in PDF points */
  x: number;
  /** Bottom edge, in PDF points (PDF coordinate space — origin at bottom-left) */
  y: number;
  /** Width, in PDF points */
  width: number;
  /** Height, in PDF points */
  height: number;
  rotation: number;
  label: string;
  required: boolean;
  locked: boolean;
  visible: boolean;
  z_index: number;
  placeholder?: string;
  recipient_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFieldPayload {
  field_type: FieldType;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  label?: string;
  required?: boolean;
  placeholder?: string;
  recipient_id?: string | null;
}

/** Backend's GET /documents/{id}/fields groups fields by page. */
export interface PageFieldGroup {
  page_number: number;
  fields: DocumentField[];
}

export interface MoveFieldPayload {
  x: number;
  y: number;
}

/** Resize endpoint only accepts width/height — position is changed via a separate move call. */
export interface ResizeFieldPayload {
  width: number;
  height: number;
}

export interface UpdateFieldPayload {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  label?: string;
  required?: boolean;
  locked?: boolean;
  visible?: boolean;
  z_index?: number;
  placeholder?: string;
  recipient_id?: string | null;
}

export interface FieldPaletteItem {
  type: FieldType;
  label: string;
  description: string;
  icon: string;
}

export const FIELD_PALETTE_ITEMS: FieldPaletteItem[] = [
  { type: 'SIGNATURE', label: 'Signature', description: 'Full signature', icon: 'pen' },
  { type: 'INITIAL',   label: 'Initial',   description: 'Initials only',  icon: 'pen-line' },
  { type: 'TEXT',      label: 'Text',      description: 'Free-form text', icon: 'type' },
  { type: 'DATE',      label: 'Date',      description: 'Date picker',    icon: 'calendar' },
  { type: 'CHECKBOX',  label: 'Checkbox',  description: 'Yes / No',       icon: 'square-check' },
];

export const DRAG_TYPE_KEY = 'application/x-field-type';
