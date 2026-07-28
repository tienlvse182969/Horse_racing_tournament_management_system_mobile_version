import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { mapSpectatorRace } from '@/api/mappers';
import { spectatorApi } from '@/api/spectator.api';
import type { TournamentDto } from '@/api/spectator.api';
import type { Race } from '@/types/race';
import type { Notification } from '@/mock-data/notifications';
import type { Prediction } from '@/mock-data/predictions';
import { createPolledResource, usePolledResource } from './polled-resource';

const POLL_INTERVAL_MS = 8000;

const spectatorRacesResource = createPolledResource<Race[]>(
  [],
  () => spectatorApi.listRaces().then((res) => res.races.map(mapSpectatorRace)),
  POLL_INTERVAL_MS,
);

export function useSpectatorRaces() {
  const { data: races, loading, error, reload } = usePolledResource(spectatorRacesResource);
  return { races, loading, error, reload };
}

export type PointTransaction = {
  id: string; type: string; points: number; balanceAfter: number; note?: string; createdAt: string;
};

const spectatorPointsResource = createPolledResource(
  { currentBalance: 0, totalPointsEarned: 0, totalPointsSpent: 0, transactions: [] as PointTransaction[] },
  () => spectatorApi.getPoints().then((res) => res.points),
  POLL_INTERVAL_MS,
);

export function useSpectatorPoints() {
  const { data, reload } = usePolledResource(spectatorPointsResource);
  return {
    balance: data.currentBalance,
    totalEarned: data.totalPointsEarned,
    totalSpent: data.totalPointsSpent,
    transactions: data.transactions.slice(0, 50),
    reload,
  };
}

function mapPrediction(p: Awaited<ReturnType<typeof spectatorApi.listPredictions>>['predictions'][number]): Prediction {
  return {
    id: p.id,
    raceId: p.raceId,
    raceName: p.raceName,
    raceDate: p.createdAt.slice(0, 10),
    predictedHorseId: p.predictedRanks[0]?.horseId ?? '',
    predictedHorseName: p.predictedRanks[0]?.horseName ?? '-',
    predictedHorseNumber: p.predictedRanks[0]?.rank ?? 0,
    status: (
      p.status === 'correct' ? 'won' :
      p.status === 'partial' ? 'partial' :
      p.status === 'incorrect' ? 'lost' :
      p.status === 'cancelled' ? 'cancelled' :
      'pending'
    ) as Prediction['status'],
    madeAt: p.createdAt,
    points: p.totalPoints,
    reward: p.totalPoints > 0 ? p.totalPoints : undefined,
    ticketCount: p.ticketCount,
    riskMultiplier: p.riskMultiplier,
    contribution: p.contribution,
  };
}

const spectatorPredictionsResource = createPolledResource<Prediction[]>(
  [],
  () => spectatorApi.listPredictions().then((res) => res.predictions.map(mapPrediction)),
  POLL_INTERVAL_MS,
);

export function useSpectatorPredictions() {
  const { data: predictions, loading, reload } = usePolledResource(spectatorPredictionsResource);

  const cancelPrediction = useCallback(async (predictionId: string) => {
    try {
      await spectatorApi.cancelPrediction(predictionId);
      reload(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Không thể hủy dự đoán';
      Alert.alert('Không thể hủy', message);
    }
  }, [reload]);

  return { predictions, loading, reload, cancelPrediction };
}

export function useSpectatorTopUps() {
  const [topUps, setTopUps] = useState<Awaited<ReturnType<typeof spectatorApi.listTopUps>>['payments']>([]);
  const reload = useCallback(() => {
    spectatorApi.listTopUps().then((res) => setTopUps(res.payments)).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { topUps, reload };
}

const spectatorNotificationsResource = createPolledResource<Notification[]>(
  [],
  () => spectatorApi.listNotifications().then((res) => res.notifications.map((n) => ({
    id: n.id,
    type: 'system' as Notification['type'],
    title: n.title,
    body: n.message,
    time: n.createdAt,
    read: n.isRead,
  }))),
  POLL_INTERVAL_MS,
);

export function useSpectatorNotifications() {
  const { data: notifications, loading, reload, mutate } = usePolledResource(spectatorNotificationsResource);
  return { notifications, loading, setNotifications: mutate, reload };
}

export function useSpectatorTournaments() {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    return spectatorApi.listTournaments()
      .then(res => setTournaments(res.tournaments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { tournaments, loading, reload };
}

export function useSpectatorProducts() {
  const [products, setProducts] = useState<Awaited<ReturnType<typeof spectatorApi.listProducts>>['products']>([]);
  useEffect(() => {
    spectatorApi.listProducts().then((res) => setProducts(res.products)).catch(() => {});
  }, []);
  return { products };
}
