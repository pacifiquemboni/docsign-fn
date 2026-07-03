import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './tokenManager';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 60_000,
  headers: { Accept: 'application/json' },
});

// ── Request: attach Bearer token ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: auto-refresh on 401, normalize errors ──────────────────────────
let _isRefreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail?: string; message?: string }>) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Try to refresh once on 401, but not on auth endpoints themselves
    if (
      error.response?.status === 401 &&
      !originalConfig._retry &&
      !originalConfig.url?.includes('/auth/')
    ) {
      originalConfig._retry = true;

      if (_isRefreshing) {
        // Queue this request until the in-flight refresh completes
        return new Promise((resolve, reject) => {
          _refreshQueue.push((newToken) => {
            if (newToken) {
              originalConfig.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalConfig));
            } else {
              reject(error);
            }
          });
        });
      }

      _isRefreshing = true;
      const refreshed = await tokenManager.tryRefresh();
      _isRefreshing = false;
      const newToken = tokenManager.getAccessToken();

      // Flush the queue
      _refreshQueue.forEach((cb) => cb(refreshed ? newToken : null));
      _refreshQueue = [];

      if (refreshed && newToken) {
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return api(originalConfig);
      }

      // Refresh failed — redirect to login
      tokenManager.clear();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    // Normalize error message
    let message = 'An unexpected error occurred';
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'object' && 'detail' in data) {
        message = String(data.detail);
      } else if (typeof data === 'object' && 'message' in data) {
        message = String(data.message);
      }
    } else {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
