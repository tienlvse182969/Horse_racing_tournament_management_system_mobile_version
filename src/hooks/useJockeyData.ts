import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { mapInvitation, mapJockeyRace } from '@/api/mappers';
import { jockeyApi } from '@/api/jockey.api';
import type { PenaltyDetailDto } from '@/api/jockey.api';
import type { Invitation, JockeyRace } from '@/mock-data/jockey';
import { jockeyRaces } from '@/mock-data/jockey';
import { races } from '@/mock-data/races';
import type { Race } from '@/mock-data/races';

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
