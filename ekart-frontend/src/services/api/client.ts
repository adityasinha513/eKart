import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthSession } from "../../types/Auth";

export const AUTH_STORAGE_KEY = "mithai-junction-auth";

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeStoredSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/** Notified whenever the stored session changes so React contexts outside this module can react. */
type SessionListener = (session: AuthSession | null) => void;
const listeners = new Set<SessionListener>();

export function onSessionChange(listener: SessionListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSession(session: AuthSession | null) {
  writeStoredSession(session);
  listeners.forEach((listener) => listener(session));
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = readStoredSession();
  if (session?.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<AuthSession | null> | null = null;

async function performRefresh(): Promise<AuthSession | null> {
  const session = readStoredSession();
  if (!session?.refreshToken) return null;

  try {
    const response = await axios.post(
      `${apiClient.defaults.baseURL}/auth/refresh-token`,
      { refreshToken: session.refreshToken }
    );
    const next: AuthSession = response.data;
    setSession(next);
    return next;
  } catch {
    setSession(null);
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      if (refreshed) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export { setSession as setStoredSession };
