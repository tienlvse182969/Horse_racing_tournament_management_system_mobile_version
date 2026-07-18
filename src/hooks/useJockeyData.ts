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

const POLL_INTERVAL_MS = 8000;

export function useJockeyInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    return jockeyApi
      .listInvitations()
      .then((res) => setInvitations(res.invitations.map(mapInvitation)))
      .catch(() => {})
      .finally(() => { if (showLoading) setLoading(false); });
  }, []);

  const respond = useCallback(async (id: string, action: 'accept' | 'decline') => {
    try {
      await jockeyApi.respondInvitation(id, action);
      reload(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Không thể phản hồi lời mời';
      Alert.alert('Không thể thực hiện', message);
    }
  }, [reload]);

  useEffect(() => {
    reload();
    const interval = setInterval(() => reload(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [reload]);
  return { invitations, loading, reload, respond };
}

export function useJockeyRaces() {
  const [races, setRaces] = useState<JockeyRace[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    return jockeyApi
      .listRaces()
      .then((res) => setRaces(res.races.map(mapJockeyRace)))
      .catch(() => {})
      .finally(() => { if (showLoading) setLoading(false); });
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(() => reload(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [reload]);
  return { races, loading, reload };
}

export function useJockeyDashboard() {
  const [stats, setStats] = useState({ pendingInvitations: 0, upcomingRaces: 0, completedRaces: 0 });
  useEffect(() => {
    const load = () => jockeyApi.dashboard().then(setStats).catch(() => {});
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
  return stats;
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

export function useJockeyPoints() {
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof jockeyApi.getPoints>>['points']['transactions']>([]);
  const reload = useCallback(() => {
    jockeyApi.getPoints().then((res) => {
      setBalance(res.points.currentBalance);
      setTotalEarned(res.points.totalPointsEarned);
      setTotalSpent(res.points.totalPointsSpent);
      setTransactions(res.points.transactions.filter(tx => tx.points > 0).slice(0, 10));
    }).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { balance, totalEarned, totalSpent, transactions, reload };
}

export function useJockeyNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const reload = useCallback(() => {
    jockeyApi.listNotifications().then((res) => {
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
