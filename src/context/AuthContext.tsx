import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth.api';
import * as notificationsApi from '@/api/notifications.api';
import type { AuthUser } from '@/api/auth.api';
import {
  clearStoredPushToken,
  getStoredPushToken,
  registerForPushNotificationsAsync,
} from '@/lib/push-notifications';

const PENALTY_POLL_INTERVAL_MS = 8000;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  registerSpectator: (email: string, password: string, fullName: string, phone?: string) => Promise<AuthUser>;
  updateProfile: (input: { fullName?: string; phone?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .getMe()
      .then(({ user: me }) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Poll for account status changes (e.g. a referee publishing a suspension)
  // while logged in, so the suspension banner appears without needing to re-login.
  // Jockey-only: this is the only role the app shows a suspension banner for.
  useEffect(() => {
    if (!user || user.role !== 'jockey') return;
    const interval = setInterval(() => {
      authApi.getMe().then(({ user: me }) => setUser(me)).catch(() => {});
    }, PENALTY_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user || (user.role !== 'spectator' && user.role !== 'jockey')) return;
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) return notificationsApi.registerDeviceToken(token);
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { user: me } = await authApi.login(email, password);
    setUser(me);
    return me;
  }, []);

  const registerSpectator = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    setError(null);
    const { user: me } = await authApi.registerSpectator(email, password, fullName, phone);
    setUser(me);
    return me;
  }, []);

  const updateProfile = useCallback(async (input: { fullName?: string; phone?: string }) => {
    setError(null);
    const { user: me } = await authApi.updateProfile(input);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    const pushToken = await getStoredPushToken();
    if (pushToken) {
      await notificationsApi.unregisterDeviceToken(pushToken).catch(() => {});
      await clearStoredPushToken().catch(() => {});
    }
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      registerSpectator,
      updateProfile,
      logout,
      clearError: () => setError(null),
    }),
    [user, loading, error, login, registerSpectator, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
