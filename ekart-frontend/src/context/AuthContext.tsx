import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "../services/api/auth";
import { onSessionChange, readStoredSession, setStoredSession } from "../services/api/client";
import type { AuthSession, AuthUser } from "../types/Auth";
import { extractErrorMessage } from "../utils/errors";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (emailId: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    emailId: string,
    phoneNumber: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toUser(session: AuthSession | null): AuthUser | null {
  if (!session) return null;
  return {
    emailId: session.emailId,
    name: session.name,
    phoneNumber: session.phoneNumber,
    role: session.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    setSession(readStoredSession());
    setIsAuthLoading(false);

    const unsubscribe = onSessionChange((next) => setSession(next));
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (emailId: string, password: string) => {
    try {
      const nextSession = await authApi.login({ emailId, password });
      setStoredSession(nextSession);
      return { success: true };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error, "Invalid email or password.") };
    }
  };

  const register = async (name: string, emailId: string, phoneNumber: string, password: string) => {
    try {
      await authApi.register({ emailId, name, phoneNumber, password });
      return { success: true };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error, "Could not create your account.") };
    }
  };

  const logout = () => {
    const current = readStoredSession();
    setStoredSession(null);
    if (current?.refreshToken) {
      authApi.logout(current.refreshToken).catch(() => {
        /* best-effort — session is already cleared locally */
      });
    }
  };

  const value = useMemo(
    () => ({
      user: toUser(session),
      isAuthenticated: Boolean(session?.accessToken),
      isAuthLoading,
      login,
      register,
      logout,
    }),
    [session, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
