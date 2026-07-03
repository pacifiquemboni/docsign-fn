// ── Enums (match backend string values exactly) ───────────────────────────────

export type SessionStatus =
  | 'DRAFT'
  | 'SENT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED';

export type SigningOrderMode = 'PARALLEL' | 'SEQUENTIAL';

export type RecipientStatus =
  | 'PENDING'
  | 'VIEWED'
  | 'SIGNED'
  | 'DECLINED'
  | 'EXPIRED';

export type AuditEventType =
  | 'SESSION_CREATED'
  | 'RECIPIENT_ADDED'
  | 'FIELD_ASSIGNED'
  | 'EMAIL_SENT'
  | 'LINK_OPENED'
  | 'DOCUMENT_VIEWED'
  | 'FIELD_COMPLETED'
  | 'SIGNATURE_APPLIED'
  | 'SIGNING_COMPLETED'
  | 'DOCUMENT_DOWNLOADED'
  | 'REMINDER_SENT'
  | 'SESSION_EXPIRED'
  | 'SESSION_CANCELLED'
  | 'SESSION_DECLINED'
  | 'LINK_REVOKED';

// ── Response shapes (match backend Pydantic models exactly) ──────────────────

export interface RecipientFieldResponse {
  id: string;
  recipient_id: string;
  field_id: string;
}

export interface RecipientResponse {
  id: string;
  session_id: string;
  full_name: string;
  email: string;
  color: string;
  signing_order: number;
  status: RecipientStatus;
  viewed_at: string | null;
  signed_at: string | null;
  created_at: string;
}

export interface SigningLinkResponse {
  id: string;
  recipient_id: string;
  signing_url: string;
  expires_at: string;
  created_at: string;
}

export interface AuditEventResponse {
  id: string;
  session_id: string;
  recipient_id: string | null;
  event_type: AuditEventType;
  ip_address: string | null;
  event_metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SessionProgressResponse {
  total: number;
  pending: number;
  viewed: number;
  signed: number;
  declined: number;
}

export interface SessionResponse {
  id: string;
  document_id: string;
  title: string;
  message: string | null;
  status: SessionStatus;
  signing_order: SigningOrderMode;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SessionDetailResponse extends SessionResponse {
  recipients: RecipientResponse[];
  progress: SessionProgressResponse;
  recent_events: AuditEventResponse[];
}

export interface SigningContextResponse {
  session_title: string;
  session_message: string | null;
  session_expires_at: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_color: string;
  document_id: string;
  assigned_fields: RecipientFieldResponse[];
  already_signed: boolean;
}

// ── Request payloads ──────────────────────────────────────────────────────────

export interface CreateSessionPayload {
  title: string;
  message?: string;
  signing_order: SigningOrderMode;
  expires_in_days?: number;
}

export interface AddRecipientPayload {
  full_name: string;
  email: string;
  color: string;
  signing_order: number;
}

export interface UpdateRecipientPayload {
  full_name?: string;
  email?: string;
  color?: string;
  signing_order?: number;
}

// ── Local field-assignment map (fieldId → recipientId) ───────────────────────
export type FieldAssignmentMap = Record<string, string>;

// ── Preset recipient colors ───────────────────────────────────────────────────
export const RECIPIENT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
] as const;
