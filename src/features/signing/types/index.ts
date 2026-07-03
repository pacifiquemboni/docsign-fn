export type SignatureType = 'DRAWN' | 'UPLOADED' | 'TYPED';
export type SignatureTab = 'draw' | 'upload' | 'type' | 'saved';

export const HANDWRITING_FONTS = [
  'Pacifico',
  'Great Vibes',
  'Dancing Script',
  'Allura',
] as const;
export type HandwritingFont = (typeof HANDWRITING_FONTS)[number];

// ── API response shapes (match backend Pydantic models exactly) ────────────────

export interface SignatureRecord {
  id: string;
  signature_type: SignatureType;
  font_name: string | null;
  signature_text: string | null;
  width: number;
  height: number;
  created_at: string;
}

export interface DocumentSignatureRecord {
  id: string;
  document_id: string;
  field_id: string;
  signature_id: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signed_at: string;
}

export interface SignedDocumentRecord {
  id: string;
  original_document_id: string;
  checksum: string;
  file_size: number;
  signed_at: string;
}

// ── Local completion state (ephemeral — lives in SigningPage state) ────────────

export type FieldCompletion =
  | { kind: 'signature'; signature_id: string; record: DocumentSignatureRecord | null }
  | { kind: 'text'; value: string }
  | { kind: 'date'; value: string }
  | { kind: 'checkbox'; checked: boolean };

/** fieldId → completion */
export type FieldCompletions = Record<string, FieldCompletion>;

// ── Request types ──────────────────────────────────────────────────────────────

export interface TypeSignaturePayload {
  text: string;
  font: HandwritingFont;
}

export type CreateSignatureInput =
  | { type: 'draw'; blob: Blob }
  | { type: 'upload'; file: File }
  | { type: 'type'; text: string; font: HandwritingFont };
