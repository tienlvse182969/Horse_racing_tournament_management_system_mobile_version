import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'horse-racing-token';
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

const isWeb = Platform.OS === 'web';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getStoredToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string | null): Promise<void> {
  if (isWeb) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      (data as { message?: string }).message ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return data as T;
}

export const apiGet = <T,>(path: string) => apiRequest<T>(path);
export const apiPost = <T,>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
export const apiPatch = <T,>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined });
