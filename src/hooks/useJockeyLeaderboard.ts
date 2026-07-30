import { useCallback, useEffect, useState } from 'react';
import { leaderboardApi } from '@/api/leaderboard.api';
import type { JockeyLeaderboardEntryDto } from '@/api/leaderboard.api';

export function useJockeyLeaderboard(limit?: number) {
  const [entries, setEntries] = useState<JockeyLeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return leaderboardApi
      .getJockeyLeaderboard(limit)
      .then((res) => setEntries(res.leaderboard.jockeys))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { entries, loading, reload };
}
