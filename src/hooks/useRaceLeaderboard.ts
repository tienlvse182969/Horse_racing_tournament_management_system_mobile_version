import { useCallback, useEffect, useState } from 'react';
import { leaderboardApi } from '@/api/leaderboard.api';
import type { RaceLeaderboardDto } from '@/api/leaderboard.api';

export function useRaceLeaderboard(raceId: string) {
  const [leaderboard, setLeaderboard] = useState<RaceLeaderboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return leaderboardApi
      .getRaceLeaderboard(raceId)
      .then((res) => setLeaderboard(res.leaderboard))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [raceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { leaderboard, loading, reload };
}
