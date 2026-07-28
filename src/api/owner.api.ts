import { File, UploadType } from 'expo-file-system';
import { API_BASE, ApiError, apiDelete, apiGet, apiPost } from './client';

export interface OwnerHorse {
  id: string;
  registrationId?: string;
  name: string;
  breed: string;
  age: number;
  weight?: number;
  color?: string;
  trainerName?: string;
  profilePdfUrl?: string;
  profilePdfName?: string;
  healthStatus: 'fit' | 'injured' | 'retired';
  currentJockey?: { id: string; fullName: string } | null;
}

export interface OwnerRegistration {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  horse: { id: string; name: string; healthStatus: string };
  race: { id: string; name: string; round: number; status: string; scheduledAt?: string };
  jockey?: { id: string; fullName: string } | null;
  createdAt?: string;
}

export interface OwnerTournament {
  _id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  prizePool?: number;
}

export interface OwnerRace {
  _id?: string;
  id?: string;
  name: string;
  round: number;
  scheduledAt: string;
  status: string;
  distance?: number;
}

export interface OwnerInvitation {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  horse: { id: string; name: string };
  race: { id: string; name: string; scheduledAt?: string; status: string };
  jockey?: { id: string; fullName: string } | null;
  createdAt: string;
}

export interface JockeySearchItem {
  id: string;
  fullName: string;
  licenseNumber?: string;
}

export const ownerApi = {
  listHorses: () => apiGet<{ success: boolean; data: OwnerHorse[] }>('/api/horse-owner/horses'),
  uploadHorsePdf: async (uri: string, mimeType?: string) => {
    const file = new File(uri);
    const result = await file.upload(`${API_BASE}/api/horse-owner/horses/upload-pdf`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: mimeType ?? 'application/pdf',
    });
    const data = JSON.parse(result.body || '{}');
    if (result.status < 200 || result.status >= 300) {
      throw new ApiError(data.message ?? `Request failed (${result.status})`, result.status);
    }
    return data as { success: boolean; data: { url: string; name: string } };
  },
  createHorse: (data: {
    name: string;
    breed: string;
    age: number;
    weight?: number;
    color?: string;
    trainerName?: string;
    registrationId?: string;
    profilePdfUrl: string;
    profilePdfName: string;
  }) => apiPost<{ success: boolean; data: OwnerHorse }>('/api/horse-owner/horses', data),
  listRegistrations: () => apiGet<{ success: boolean; data: OwnerRegistration[] }>('/api/horse-owner/registrations'),
  registerForRace: (raceId: string, horseId: string) =>
    apiPost<{ success: boolean; data: OwnerRegistration }>('/api/horse-owner/registrations', { raceId, horseId }),
  cancelRegistration: (id: string) =>
    apiDelete<{ success: boolean; message: string }>(`/api/horse-owner/registrations/${id}`),
  listTournaments: () =>
    apiGet<{ items: OwnerTournament[]; total: number; page: number; pages: number }>('/api/horse-owner/tournaments?page=1&limit=100'),
  listRacesForTournament: (tournamentId: string) =>
    apiGet<{ races: OwnerRace[] }>(`/api/horse-owner/tournaments/${tournamentId}/races`),
  listInvitations: () => apiGet<{ success: boolean; data: OwnerInvitation[] }>('/api/horse-owner/invitations'),
  searchJockeys: (name: string) =>
    apiGet<{ data: JockeySearchItem[] }>(`/api/horse-owner/jockeys/search?name=${encodeURIComponent(name)}`),
  inviteJockey: (raceId: string, horseId: string, jockeyId: string, message?: string) =>
    apiPost<{ success: boolean; data: OwnerInvitation }>('/api/horse-owner/invitations', {
      raceId,
      horseId,
      jockeyId,
      ...(message ? { message } : {}),
    }),
};
