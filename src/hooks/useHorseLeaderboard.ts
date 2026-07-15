import { useCallback, useEffect, useState } from 'react';
import { leaderboardApi } from '@/api/leaderboard.api';
import type { HorseLeaderboardEntryDto } from '@/api/leaderboard.api';

export function useHorseLeaderboard(limit?: number) {
  const [entries, setEntries] = useState<HorseLeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return leaderboardApi
      .getHorseLeaderboard(limit)
      .then((res) => setEntries(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { entries, loading, reload };
}
