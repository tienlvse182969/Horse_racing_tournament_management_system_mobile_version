import { apiGet } from './client';

export const leaderboardApi = {
  getHorseLeaderboard: (limit?: number) =>
    apiGet<{ items: HorseLeaderboardEntryDto[] }>(
      `/api/leaderboards/horses${limit ? `?limit=${limit}` : ''}`,
    ),
};

export interface HorseLeaderboardEntryDto {
  rank: number;
  horseId: string;
  horseName: string;
  ownerId: string | null;
  ownerName: string | null;
  firstPlaceWins: number;
  totalPublishedRaces: number;
  winRate: number;
  latestWinAt: string | null;
  latestRaceName: string | null;
}
