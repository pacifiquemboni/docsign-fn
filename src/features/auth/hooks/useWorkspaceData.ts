import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiKeysApi,
  permissionsApi,
  rolesApi,
  usersApi,
  workspaceApi,
} from '../api/authApi';
import type {
  CreateApiKeyPayload,
  CreateRolePayload,
  InviteUserPayload,
  UpdateBrandingPayload,
  UpdateRolePayload,
  UpdateWorkspaceSettingsPayload,
} from '../types';

// ── Users ─────────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    staleTime: 30_000,
    select: (res) => res.data ?? [],
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteUserPayload) => usersApi.invite(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      usersApi.assignRole(userId, roleId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ── Roles ─────────────────────────────────────────────────────────────────────

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
    staleTime: 60_000,
    select: (res) => res.data ?? [],
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: UpdateRolePayload }) =>
      rolesApi.update(roleId, payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesApi.delete(roleId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

// ── Permissions ───────────────────────────────────────────────────────────────

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.list,
    staleTime: Infinity,
    select: (res) => res.data ?? [],
  });
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeysApi.list,
    staleTime: 30_000,
    select: (res) => res.data ?? [],
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) => apiKeysApi.create(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => apiKeysApi.revoke(keyId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

// ── Workspace settings ────────────────────────────────────────────────────────

export function useWorkspaceSettings() {
  return useQuery({
    queryKey: ['workspace', 'settings'],
    queryFn: workspaceApi.getSettings,
    staleTime: 60_000,
    select: (res) => res.data ?? null,
  });
}

export function useUpdateWorkspaceSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkspaceSettingsPayload) =>
      workspaceApi.updateSettings(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workspace'] }),
  });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBrandingPayload) => workspaceApi.updateBranding(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workspace'] }),
  });
}
