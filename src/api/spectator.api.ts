import { apiGet, apiPatch, apiPost } from './client';

const createTopUpRequest = (points: number) =>
  apiPost<{ payment: PaymentTransactionDto; points: SpectatorPointsDto }>('/api/spectator/top-ups', { points });

export const spectatorApi = {
  listTournaments: () => apiGet<{ tournaments: TournamentDto[] }>('/api/spectator/tournaments'),
  listRaces: (filter?: string) =>
    apiGet<{ races: SpectatorRaceDto[] }>(`/api/spectator/races${filter ? `?filter=${filter}` : ''}`),
  getRace: (id: string) => apiGet<{ race: SpectatorRaceDto }>(`/api/spectator/races/${id}`),
  listPredictions: () => apiGet<{ predictions: PredictionDto[] }>('/api/spectator/predictions/current'),
  createPrediction: (
    raceId: string,
    predictedRanks: Array<{ rank: number; horseId: string }>,
    ticketCount = 1,
  ) =>
    apiPost(`/api/spectator/predictions/${raceId}`, { raceId, predictedRanks, ticketCount }),
  cancelPrediction: (predictionId: string) =>
    apiPatch(`/api/spectator/predictions/${predictionId}/cancel`),
  getPoints: () => apiGet<{ points: SpectatorPointsDto }>('/api/spectator/points'),
  createTopUp: createTopUpRequest,
  topUpPoints: createTopUpRequest,
  createPayosTopUp: (points: number) =>
    apiPost<{ payment: PaymentTransactionDto; paymentUrl: string }>('/api/spectator/top-ups/payos', { points }),
  listTopUps: () => apiGet<{ payments: PaymentTransactionDto[] }>('/api/spectator/top-ups'),
  listProducts: () => apiGet<{ products: ProductDto[] }>('/api/spectator/products'),
  redeem: (productId: string, quantity = 1) =>
    apiPost('/api/spectator/redemptions', { productId, quantity }),
  purchaseViewingPass: (raceId: string) => apiPost(`/api/spectator/races/${raceId}/viewing-pass`),
  listNotifications: () => apiGet<{ notifications: NotificationDto[] }>('/api/spectator/notifications'),
  getSimulation: (id: string) =>
    apiGet<{ available: boolean; rankings: Array<{ horseId: string; rank: number; finishTime?: number }> }>(
      `/api/spectator/races/${id}/simulation`,
    ),
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
  participants: Array<{ id: string; name: string; laneNumber: number; ticketCount: number }>;
  canPredict: boolean;
  hasPrediction: boolean;
  predictionOpenAt?: string | null;
  predictionCloseAt?: string | null;
  predictionConfig: { isEnabled: boolean; poolEnabled: boolean; entryFee: number; ticketPrice: number; quickRiskMultipliers: number[] };
  viewingTicket: { requiresTicket: boolean; hasPass: boolean; canPurchase: boolean; pricePoints: number };
  streamUrl?: string;
  result?: {
    rankings: Array<{
      rank: number;
      horse: { id: string; name: string };
      jockey: { fullName: string };
      isDisqualified?: boolean;
      finishTime?: number;
    }>;
    violations: Array<{
      target: 'horse' | 'jockey' | 'both';
      horseId: string | null;
      horseName: string | null;
      jockeyId: string | null;
      jockeyName: string | null;
      type: string;
      description: string;
      penaltyApplied: string | null;
    }>;
  } | null;
}

export interface PredictionDto {
  id: string;
  raceId: string;
  raceName: string;
  tournamentName?: string;
  predictedRanks: Array<{ rank: number; horseId: string; horseName?: string }>;
  status: string;
  ticketCount: number;
  riskMultiplier: number;
  contribution: number;
  pointsEarned: number;
  bonusPoints: number;
  poolShare: number;
  totalPoints: number;
  evaluatedAt?: string | null;
  createdAt: string;
}

export interface PaymentTransactionDto {
  id: string;
  provider: string;
  amountVnd: number;
  points: number;
  exchangeRateVndPerPoint: number;
  status: string;
  providerTransactionId?: string | null;
  paidAt?: string | null;
  expiredAt?: string | null;
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
