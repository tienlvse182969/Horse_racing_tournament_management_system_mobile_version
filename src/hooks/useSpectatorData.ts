import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { mapSpectatorRace } from '@/api/mappers';
import { spectatorApi } from '@/api/spectator.api';
import type { TournamentDto } from '@/api/spectator.api';
import type { Race } from '@/types/race';
import type { Notification } from '@/mock-data/notifications';
import type { Prediction } from '@/mock-data/predictions';

export function useSpectatorRaces() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    spectatorApi
      .listRaces()
      .then((res) => setRaces(res.races.map(mapSpectatorRace)))
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { races, loading, error, reload };
}

export type PointTransaction = {
  id: string; type: string; points: number; balanceAfter: number; note?: string; createdAt: string;
};

export function useSpectatorPoints() {
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const reload = useCallback(() => {
    spectatorApi.getPoints().then((res) => {
      setBalance(res.points.currentBalance);
      setTotalEarned(res.points.totalPointsEarned);
      setTransactions(res.points.transactions.filter(tx => tx.points > 0).slice(0, 10));
    }).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { balance, totalEarned, transactions, reload };
}

export function useSpectatorPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const reload = useCallback(() => {
    spectatorApi.listPredictions().then((res) => {
      setPredictions(
        res.predictions.map((p) => ({
          id: p.id,
          raceId: p.raceId,
          raceName: p.raceName,
          raceDate: p.createdAt.slice(0, 10),
          predictedHorseId: p.predictedRanks[0]?.horseId ?? '',
          predictedHorseName: p.predictedRanks[0]?.horseName ?? '-',
          predictedHorseNumber: p.predictedRanks[0]?.rank ?? 0,
          status: (
            p.status === 'correct' ? 'won' :
            p.status === 'incorrect' ? 'lost' :
            p.status === 'cancelled' ? 'cancelled' :
            'pending'
          ) as Prediction['status'],
          madeAt: p.createdAt,
          points: p.totalPoints,
          reward: p.totalPoints > 0 ? p.totalPoints * 10 : undefined,
        })),
      );
    }).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);
  const cancelPrediction = useCallback(async (predictionId: string) => {
    try {
      await spectatorApi.cancelPrediction(predictionId);
      reload();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Không thể hủy dự đoán';
      Alert.alert('Không thể hủy', message);
    }
  }, [reload]);
  return { predictions, reload, cancelPrediction };
}

export function useSpectatorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const reload = useCallback(() => {
    spectatorApi.listNotifications().then((res) => {
      setNotifications(
        res.notifications.map((n) => ({
          id: n.id,
          type: 'system' as Notification['type'],
          title: n.title,
          body: n.message,
          time: n.createdAt,
          read: n.isRead,
        })),
      );
    }).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { notifications, setNotifications, reload };
}

export function useSpectatorTournaments() {
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    spectatorApi.listTournaments()
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
