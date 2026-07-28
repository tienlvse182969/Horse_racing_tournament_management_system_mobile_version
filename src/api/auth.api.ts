import { File, UploadType } from 'expo-file-system';
import { apiGet, apiPatch, apiPost, setStoredToken, API_BASE, ApiError } from './client';
import type { PenaltyStatus } from '@/mock-data';

export type UserRole = 'spectator' | 'jockey' | 'horse_owner' | 'referee' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  penaltyStatus?: PenaltyStatus | null;
  licenseNumber?: string;
  licenseExpiry?: string | null;
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

export async function registerSpectator(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse>('/api/auth/register', { email, password, fullName, phone });
  await setStoredToken(res.token);
  return res;
}

export interface JockeyApplicationResponse {
  message: string;
  approvalRequired: true;
  applicationStatus: 'pending';
}

export interface JockeyLicenseFile {
  uri: string;
  mimeType?: string;
}

export async function registerJockey(input: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  licenseDocument: JockeyLicenseFile;
}): Promise<JockeyApplicationResponse> {
  const file = new File(input.licenseDocument.uri);
  const result = await file.upload(`${API_BASE}/api/auth/register`, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType: input.licenseDocument.mimeType ?? 'application/pdf',
    parameters: {
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      phone: input.phone,
      role: 'jockey',
    },
  });

  const data = JSON.parse(result.body || '{}');
  if (result.status < 200 || result.status >= 300) {
    throw new ApiError(data.message ?? `Request failed (${result.status})`, result.status);
  }
  return data as JockeyApplicationResponse;
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

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/reset-password', { token, newPassword });
}

export async function updateProfile(input: { fullName?: string; phone?: string }): Promise<{ user: AuthUser }> {
  return apiPatch<{ user: AuthUser }>('/api/auth/me', input);
}
