import { apiGet, apiPatch } from './client';

export const jockeyApi = {
  dashboard: () =>
    apiGet<{ pendingInvitations: number; upcomingRaces: number; completedRaces: number }>(
      '/api/jockey/dashboard',
    ),
  listInvitations: (status?: string) =>
    apiGet<{ invitations: InvitationDto[] }>(
      `/api/jockey/invitations${status ? `?status=${status}` : ''}`,
    ),
  respondInvitation: (id: string, action: 'accept' | 'decline') =>
    apiPatch(`/api/jockey/invitations/${id}`, { action }),
  listRaces: () => apiGet<{ races: JockeyRaceDto[] }>('/api/jockey/races'),
  getRace: (id: string) => apiGet<{ race: JockeyRaceDto }>(`/api/jockey/races/${id}`),
  listNotifications: () => apiGet<{ notifications: NotificationDto[] }>('/api/jockey/notifications'),
  getPenaltyDetail: () => apiGet<{ penalty: PenaltyDetailDto }>('/api/jockey/penalty-detail'),
};

export interface PenaltyStatusDto {
  isBanned: boolean;
  bannedUntil: string | null;
  reason: string | null;
}

export interface InvitationDto {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
  horse: { id: string; name: string; penaltyStatus: PenaltyStatusDto };
  race: { id: string; name: string; scheduledAt?: string; status: string };
  owner: { id: string; fullName: string };
}

export interface JockeyRaceDto {
  id: string;
  name: string;
  round: number;
  scheduledAt: string;
  status: string;
  distance?: number;
  tournament: { id: string; name: string };
  participant: {
    horse: {
      id: string;
      name: string;
      breed?: string;
      age?: number;
      color?: string;       // text name, e.g. "Chestnut", "Bay"
      healthStatus?: string;
      registrationId?: string;
      penaltyStatus: PenaltyStatusDto;
    };
    owner: { id: string; fullName: string };
    laneNumber: number;
    confirmedAt?: string | null;
  };
  result?: {
    rankings: Array<{ rank: number; horse: { name: string }; finishTime?: number; prize: number }>;
  } | null;
  track?: { name: string; location: string; surface: string } | null;
  meeting?: { name: string; date: string } | null;
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PenaltyDetailDto {
  target: 'horse' | 'jockey' | 'both';
  description: string;
  penaltyApplied: string | null;
  recordedAt: string;
  bannedUntil: string | null;
  rule: {
    code: string;
    name: string;
    description: string;
    category: string;
    severity: string;
    banDurationDays: number;
  } | null;
  race: {
    id: string;
    name: string;
    scheduledAt: string;
  } | null;
}
