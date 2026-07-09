import { apiGet, apiPost, setStoredToken } from './client';
import type { PenaltyStatus } from '@/mock-data';

export type UserRole = 'spectator' | 'jockey' | 'horse_owner' | 'referee' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  penaltyStatus?: PenaltyStatus | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse>('/api/auth/login', { email, password });
  await setStoredToken(res.token);
  return res;
}

export async function registerSpectator(email: string, password: string, fullName: string): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse>('/api/auth/register', { email, password, fullName });
  await setStoredToken(res.token);
  return res;
}

export async function getMe(): Promise<{ user: AuthUser }> {
  return apiGet<{ user: AuthUser }>('/api/auth/me');
}

export async function logout(): Promise<void> {
  await setStoredToken(null);
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/change-password', { oldPassword, newPassword });
}
