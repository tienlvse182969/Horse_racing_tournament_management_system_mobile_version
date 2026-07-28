import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { mapInvitation, mapJockeyRace } from '@/api/mappers';
import { jockeyApi } from '@/api/jockey.api';
import type { PenaltyDetailDto } from '@/api/jockey.api';
import type { Invitation, JockeyRace } from '@/mock-data/jockey';
import { jockeyRaces } from '@/mock-data/jockey';
import { races } from '@/mock-data/races';
import type { Race } from '@/mock-data/races';
import type { Notification } from '@/mock-data/notifications';
import { createPolledResource, usePolledResource } from './polled-resource';

const POLL_INTERVAL_MS = 8000;

const jockeyInvitationsResource = createPolledResource<Invitation[]>(
  [],
  () => jockeyApi.listInvitations().then((res) => res.invitations.map(mapInvitation)),
  POLL_INTERVAL_MS,
);

export function useJockeyInvitations() {
  const { data: invitations, loading, reload } = usePolledResource(jockeyInvitationsResource);

  const respond = useCallback(async (id: string, action: 'accept' | 'decline') => {
    try {
      await jockeyApi.respondInvitation(id, action);
      reload(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Không thể phản hồi lời mời';
      Alert.alert('Không thể thực hiện', message);
    }
  }, [reload]);

  return { invitations, loading, reload, respond };
}

const jockeyRacesResource = createPolledResource<JockeyRace[]>(
  [],
  () => jockeyApi.listRaces().then((res) => res.races.map(mapJockeyRace)),
  POLL_INTERVAL_MS,
);

export function useJockeyRaces() {
  const { data: races, loading, reload } = usePolledResource(jockeyRacesResource);
  return { races, loading, reload };
}

const jockeyDashboardResource = createPolledResource(
  { pendingInvitations: 0, upcomingRaces: 0, completedRaces: 0 },
  () => jockeyApi.dashboard(),
  POLL_INTERVAL_MS,
);

export function useJockeyDashboard() {
  const { data } = usePolledResource(jockeyDashboardResource);
  return data;
}

export function useJockeyPenaltyDetail(): { penalty: PenaltyDetailDto | null; loading: boolean } {
  const [penalty, setPenalty] = useState<PenaltyDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jockeyApi.getPenaltyDetail()
      .then(res => setPenalty(res.penalty))
      .catch(() => setPenalty(null))
      .finally(() => setLoading(false));
  }, []);

  return { penalty, loading };
}

const jockeyPointsResource = createPolledResource(
  { currentBalance: 0, totalPointsEarned: 0, totalPointsSpent: 0, transactions: [] as Awaited<ReturnType<typeof jockeyApi.getPoints>>['points']['transactions'] },
  () => jockeyApi.getPoints().then((res) => res.points),
);

export function useJockeyPoints() {
  const { data, reload } = usePolledResource(jockeyPointsResource);
  return {
    balance: data.currentBalance,
    totalEarned: data.totalPointsEarned,
    totalSpent: data.totalPointsSpent,
    transactions: data.transactions.filter(tx => tx.points > 0).slice(0, 10),
    reload,
  };
}

const jockeyNotificationsResource = createPolledResource<Notification[]>(
  [],
  () => jockeyApi.listNotifications().then((res) => res.notifications.map((n) => ({
    id: n.id,
    type: 'system' as Notification['type'],
    title: n.title,
    body: n.message,
    time: n.createdAt,
    read: n.isRead,
  }))),
  POLL_INTERVAL_MS,
);

export function useJockeyNotifications() {
  const { data: notifications, loading, reload, mutate } = usePolledResource(jockeyNotificationsResource);
  return { notifications, loading, setNotifications: mutate, reload };
}

export function useJockeyRaceDetail(id: string): { jockeyRace: JockeyRace | null; fullRace: Race | null } {
  const [jockeyRace, setJockeyRace] = useState<JockeyRace | null>(
    () => jockeyRaces.find(r => r.id === id) ?? null,
  );

  useEffect(() => {
    jockeyApi.getRace(id)
      .then(res => setJockeyRace(mapJockeyRace(res.race)))
      .catch(() => {
        setJockeyRace(jockeyRaces.find(r => r.id === id) ?? null);
      });
  }, [id]);

  const fullRace = jockeyRace?.fullRaceId
    ? races.find(r => r.id === jockeyRace.fullRaceId) ?? null
    : null;

  return { jockeyRace, fullRace };
}
