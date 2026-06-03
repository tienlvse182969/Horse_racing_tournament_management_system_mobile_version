import { useCallback, useEffect, useState } from 'react';
import { mapInvitation, mapJockeyRace } from '@/api/mappers';
import { jockeyApi } from '@/api/jockey.api';
import type { Invitation } from '@/mock-data/jockey';
import type { JockeyRace } from '@/mock-data/jockey';

export function useJockeyInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    jockeyApi
      .listInvitations()
      .then((res) => setInvitations(res.invitations.map(mapInvitation)))
      .finally(() => setLoading(false));
  }, []);

  const respond = useCallback(async (id: string, action: 'accept' | 'decline') => {
    await jockeyApi.respondInvitation(id, action);
    reload();
  }, [reload]);

  useEffect(() => { reload(); }, [reload]);
  return { invitations, loading, reload, respond };
}

export function useJockeyRaces() {
  const [races, setRaces] = useState<JockeyRace[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    jockeyApi
      .listRaces()
      .then((res) => setRaces(res.races.map(mapJockeyRace)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { races, loading, reload };
}

export function useJockeyDashboard() {
  const [stats, setStats] = useState({ pendingInvitations: 0, upcomingRaces: 0, completedRaces: 0 });
  useEffect(() => {
    jockeyApi.dashboard().then(setStats).catch(() => {});
  }, []);
  return stats;
}
