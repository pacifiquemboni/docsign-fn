import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tokenManager } from '@/services/tokenManager';
import { authApi } from '@/features/auth/api/authApi';
import type { OrganizationResponse, UserResponse } from '@/features/auth/types';

interface AuthState {
  user: UserResponse | null;
  organization: OrganizationResponse | null;
  permissions: string[];
  isLoading: boolean;  // true while restoring session on mount
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Parameters<typeof authApi.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    organization: null,
    permissions: [],
    isLoading: true,
    isAuthenticated: false,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Restore session from persisted refresh token ──────────────────────────
  const doRefresh = useCallback(async (): Promise<void> => {
    const rt = tokenManager.getRefreshToken();
    if (!rt) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    try {
      const res = await authApi.refresh(rt);
      if (!res.data) throw new Error('No token data');
      tokenManager.setAccessToken(res.data.access_token, res.data.expires_in);
      tokenManager.setRefreshToken(res.data.refresh_token);

      const [meRes, orgRes] = await Promise.all([
        authApi.me(),
        import('@/features/auth/api/authApi').then((m) => m.orgApi.me()),
      ]);

      setState({
        user: meRes.data,
        organization: orgRes.data,
        permissions: [],     // loaded lazily per-page via hooks
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      tokenManager.clear();
      setState({ user: null, organization: null, permissions: [], isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    tokenManager.setRefreshCallback(doRefresh);
    void doRefresh();
  }, [doRefresh]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const res = await authApi.login({ email, password });
    if (!res.data) throw new Error('Login failed');
    tokenManager.setAccessToken(res.data.access_token, res.data.expires_in);
    tokenManager.setRefreshToken(res.data.refresh_token);

    const [meRes, orgRes] = await Promise.all([
      authApi.me(),
      import('@/features/auth/api/authApi').then((m) => m.orgApi.me()),
    ]);

    setState({
      user: meRes.data,
      organization: orgRes.data,
      permissions: [],
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (payload: Parameters<typeof authApi.register>[0]): Promise<void> => {
      const res = await authApi.register(payload);
      if (!res.data) throw new Error('Registration failed');
      tokenManager.setAccessToken(res.data.access_token, res.data.expires_in);
      tokenManager.setRefreshToken(res.data.refresh_token);

      const [meRes, orgRes] = await Promise.all([
        authApi.me(),
        import('@/features/auth/api/authApi').then((m) => m.orgApi.me()),
      ]);

      setState({
        user: meRes.data,
        organization: orgRes.data,
        permissions: [],
        isLoading: false,
        isAuthenticated: true,
      });
    },
    [],
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    const rt = tokenManager.getRefreshToken();
    if (rt) {
      try { await authApi.logout(rt); } catch { /* best effort */ }
    }
    tokenManager.clear();
    qc.clear();
    setState({ user: null, organization: null, permissions: [], isLoading: false, isAuthenticated: false });
  }, [qc]);

  // ── Refresh user profile (after profile update) ───────────────────────────
  const refreshUser = useCallback(async (): Promise<void> => {
    const res = await authApi.me();
    if (res.data) setState((s) => ({ ...s, user: res.data! }));
  }, []);

  // ── Permission helpers ────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (code: string) => state.permissions.includes(code),
    [state.permissions],
  );

  const hasRole = useCallback(
    (role: string) => state.user?.role === role,
    [state.user],
  );

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, hasPermission, hasRole, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
