import api from '@/services/api';
import type { APIResponse } from '@/types/api';
import type {
  ApiKeyCreatedResponse,
  ApiKeyResponse,
  CreateApiKeyPayload,
  CreateRolePayload,
  InvitationResponse,
  InviteUserPayload,
  LoginPayload,
  OrganizationResponse,
  PermissionResponse,
  RegisterPayload,
  RoleResponse,
  TokenResponse,
  UpdateBrandingPayload,
  UpdateRolePayload,
  UpdateWorkspaceSettingsPayload,
  UserResponse,
  WorkspaceSettingsResponse,
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (payload: RegisterPayload): Promise<APIResponse<TokenResponse>> => {
    const { data } = await api.post<APIResponse<TokenResponse>>('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<APIResponse<TokenResponse>> => {
    const { data } = await api.post<APIResponse<TokenResponse>>('/auth/login', payload);
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  refresh: async (refreshToken: string): Promise<APIResponse<TokenResponse>> => {
    const { data } = await api.post<APIResponse<TokenResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  me: async (): Promise<APIResponse<UserResponse>> => {
    const { data } = await api.get<APIResponse<UserResponse>>('/auth/me');
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, new_password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, new_password });
  },

  changePassword: async (current_password: string, new_password: string): Promise<void> => {
    await api.post('/auth/change-password', { current_password, new_password });
  },

  acceptInvitation: async (
    token: string,
    first_name: string,
    last_name: string,
    password: string,
  ): Promise<APIResponse<TokenResponse>> => {
    const { data } = await api.post<APIResponse<TokenResponse>>('/auth/accept-invitation', {
      token, first_name, last_name, password,
    });
    return data;
  },
};

// ── Organization ──────────────────────────────────────────────────────────────

export const orgApi = {
  me: async (): Promise<APIResponse<OrganizationResponse>> => {
    const { data } = await api.get<APIResponse<OrganizationResponse>>('/organizations/me');
    return data;
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: async (): Promise<APIResponse<UserResponse[]>> => {
    const { data } = await api.get<APIResponse<UserResponse[]>>('/users');
    return data;
  },

  invite: async (payload: InviteUserPayload): Promise<APIResponse<InvitationResponse>> => {
    const { data } = await api.post<APIResponse<InvitationResponse>>('/users/invite', payload);
    return data;
  },

  update: async (userId: string, payload: { first_name?: string; last_name?: string }): Promise<APIResponse<UserResponse>> => {
    const { data } = await api.patch<APIResponse<UserResponse>>(`/users/${userId}`, payload);
    return data;
  },

  deactivate: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  assignRole: async (userId: string, role_id: string): Promise<void> => {
    await api.post(`/users/${userId}/role`, { role_id });
  },
};

// ── Roles ─────────────────────────────────────────────────────────────────────

export const rolesApi = {
  list: async (): Promise<APIResponse<RoleResponse[]>> => {
    const { data } = await api.get<APIResponse<RoleResponse[]>>('/roles');
    return data;
  },

  create: async (payload: CreateRolePayload): Promise<APIResponse<RoleResponse>> => {
    const { data } = await api.post<APIResponse<RoleResponse>>('/roles', payload);
    return data;
  },

  update: async (roleId: string, payload: UpdateRolePayload): Promise<APIResponse<RoleResponse>> => {
    const { data } = await api.patch<APIResponse<RoleResponse>>(`/roles/${roleId}`, payload);
    return data;
  },

  delete: async (roleId: string): Promise<void> => {
    await api.delete(`/roles/${roleId}`);
  },
};

// ── Permissions ───────────────────────────────────────────────────────────────

export const permissionsApi = {
  list: async (): Promise<APIResponse<PermissionResponse[]>> => {
    const { data } = await api.get<APIResponse<PermissionResponse[]>>('/permissions');
    return data;
  },
};

// ── API Keys ──────────────────────────────────────────────────────────────────

export const apiKeysApi = {
  list: async (): Promise<APIResponse<ApiKeyResponse[]>> => {
    const { data } = await api.get<APIResponse<ApiKeyResponse[]>>('/api-keys');
    return data;
  },

  create: async (payload: CreateApiKeyPayload): Promise<APIResponse<ApiKeyCreatedResponse>> => {
    const { data } = await api.post<APIResponse<ApiKeyCreatedResponse>>('/api-keys', payload);
    return data;
  },

  revoke: async (keyId: string): Promise<void> => {
    await api.delete(`/api-keys/${keyId}`);
  },
};

// ── Workspace ──────────────────────────────────────────────────────────────────

export const workspaceApi = {
  getSettings: async (): Promise<APIResponse<WorkspaceSettingsResponse>> => {
    const { data } = await api.get<APIResponse<WorkspaceSettingsResponse>>('/workspace/settings');
    return data;
  },

  updateSettings: async (payload: UpdateWorkspaceSettingsPayload): Promise<APIResponse<WorkspaceSettingsResponse>> => {
    const { data } = await api.patch<APIResponse<WorkspaceSettingsResponse>>('/workspace/settings', payload);
    return data;
  },

  updateBranding: async (payload: UpdateBrandingPayload): Promise<APIResponse<WorkspaceSettingsResponse>> => {
    const { data } = await api.patch<APIResponse<WorkspaceSettingsResponse>>('/workspace/branding', payload);
    return data;
  },
};
