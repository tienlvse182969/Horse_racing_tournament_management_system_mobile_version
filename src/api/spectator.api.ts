import { apiGet, apiPatch, apiPost } from './client';

export const spectatorApi = {
  listTournaments: () => apiGet<{ tournaments: TournamentDto[] }>('/api/spectator/tournaments'),
  listRaces: (filter?: string) =>
    apiGet<{ races: SpectatorRaceDto[] }>(`/api/spectator/races${filter ? `?filter=${filter}` : ''}`),
  getRace: (id: string) => apiGet<{ race: SpectatorRaceDto }>(`/api/spectator/races/${id}`),
  listPredictions: () => apiGet<{ predictions: PredictionDto[] }>('/api/spectator/predictions/current'),
  createPrediction: (raceId: string, predictedRanks: Array<{ rank: number; horseId: string }>) =>
    apiPost(`/api/spectator/predictions/${raceId}`, { raceId, predictedRanks }),
  cancelPrediction: (predictionId: string) =>
    apiPatch(`/api/spectator/predictions/${predictionId}/cancel`),
  getPoints: () => apiGet<{ points: SpectatorPointsDto }>('/api/spectator/points'),
  listProducts: () => apiGet<{ products: ProductDto[] }>('/api/spectator/products'),
  redeem: (productId: string, quantity = 1) =>
    apiPost('/api/spectator/redemptions', { productId, quantity }),
  purchaseViewingPass: (raceId: string) => apiPost(`/api/spectator/races/${raceId}/viewing-pass`),
  listNotifications: () => apiGet<{ notifications: NotificationDto[] }>('/api/spectator/notifications'),
};

export interface TournamentDto {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
}

export interface SpectatorRaceDto {
  id: string;
  name: string;
  round: number;
  scheduledAt: string;
  status: string;
  distance?: number;
  tournament: { id: string; name: string };
  participants: Array<{ id: string; name: string; laneNumber: number }>;
  canPredict: boolean;
  hasPrediction: boolean;
  viewingTicket: { requiresTicket: boolean; hasPass: boolean; canPurchase: boolean; pricePoints: number };
  streamUrl?: string;
  result?: { rankings: Array<{ rank: number; horse: { id: string; name: string }; jockey: { fullName: string } }> } | null;
}

export interface PredictionDto {
  id: string;
  raceId: string;
  raceName: string;
  predictedRanks: Array<{ rank: number; horseId: string; horseName?: string }>;
  status: string;
  totalPoints: number;
  createdAt: string;
}

export interface SpectatorPointsDto {
  currentBalance: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  transactions: Array<{ id: string; type: string; points: number; balanceAfter: number; note?: string; createdAt: string }>;
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  isInStock: boolean;
}

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
