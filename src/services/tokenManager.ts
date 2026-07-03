/**
 * Module-level singleton that holds the JWT access token in memory.
 * Never stored in localStorage. Accessible by Axios interceptors without
 * needing React context (avoids circular dependency).
 */

const REFRESH_TOKEN_KEY = 'ds_rt';

let _accessToken: string | null = null;
let _refreshFn: (() => Promise<void>) | null = null;
let _refreshSchedule: ReturnType<typeof setTimeout> | null = null;

export const tokenManager = {
  // ── Access token (memory only) ────────────────────────────────────────────
  getAccessToken(): string | null {
    return _accessToken;
  },

  setAccessToken(token: string | null, expiresIn?: number): void {
    _accessToken = token;
    if (_refreshSchedule) {
      clearTimeout(_refreshSchedule);
      _refreshSchedule = null;
    }
    if (token && expiresIn && _refreshFn) {
      // Schedule refresh 60 seconds before expiry
      const delay = Math.max((expiresIn - 60) * 1000, 5_000);
      _refreshSchedule = setTimeout(() => {
        void _refreshFn?.();
      }, delay);
    }
  },

  // ── Refresh token (sessionStorage) ───────────────────────────────────────
  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string | null): void {
    try {
      if (token) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch {
      // sessionStorage unavailable (private browsing in some browsers)
    }
  },

  // ── Refresh callback (set by AuthProvider) ────────────────────────────────
  setRefreshCallback(fn: () => Promise<void>): void {
    _refreshFn = fn;
  },

  async tryRefresh(): Promise<boolean> {
    if (!_refreshFn) return false;
    try {
      await _refreshFn();
      return true;
    } catch {
      return false;
    }
  },

  // ── Clear all tokens (logout) ─────────────────────────────────────────────
  clear(): void {
    _accessToken = null;
    if (_refreshSchedule) {
      clearTimeout(_refreshSchedule);
      _refreshSchedule = null;
    }
    tokenManager.setRefreshToken(null);
  },
};
