// ── Response shapes (match backend Pydantic models exactly) ──────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // seconds
}

export interface UserResponse {
  id: string;
  organization_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  status: string;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  role?: string | null;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  timezone: string;
  locale: string;
  subscription_plan: string;
  status: string;
  created_at: string;
}

export interface PermissionResponse {
  id: string;
  code: string;
  description: string;
  resource: string;
}

export interface RoleResponse {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[]; // permission codes
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
}

export interface ApiKeyCreatedResponse extends ApiKeyResponse {
  raw_key: string; // shown once only
}

export interface WorkspaceSettingsResponse {
  organization_id: string;
  default_expiry_days: number;
  require_email_verification: boolean;
  allow_drawn_signatures: boolean;
  allow_typed_signatures: boolean;
  allow_uploaded_signatures: boolean;
  notification_settings: Record<string, unknown> | null;
  branding: Record<string, unknown> | null;
}

export interface InvitationResponse {
  id: string;
  organization_id: string;
  email: string;
  role_id: string;
  status: string;
  expires_at: string;
  created_at: string;
}

// ── Request payloads ──────────────────────────────────────────────────────────

export interface RegisterPayload {
  organization_name: string;
  organization_slug: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface InviteUserPayload {
  email: string;
  role_id: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permission_codes: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permission_codes?: string[];
}

export interface CreateApiKeyPayload {
  name: string;
  expires_in_days?: number;
}

export interface UpdateWorkspaceSettingsPayload {
  default_expiry_days?: number;
  require_email_verification?: boolean;
  allow_drawn_signatures?: boolean;
  allow_typed_signatures?: boolean;
  allow_uploaded_signatures?: boolean;
}

export interface UpdateBrandingPayload {
  primary_color?: string;
  accent_color?: string;
  logo_url?: string;
  company_name?: string;
  email_footer?: string;
}

// ── Helper type for full user name ────────────────────────────────────────────
export function fullName(user: Pick<UserResponse, 'first_name' | 'last_name' | 'email'>): string {
  const n = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return n || user.email;
}
