import { apiGet } from './client';

export const leaderboardApi = {
  getHorseLeaderboard: (limit?: number) =>
    apiGet<{ items: HorseLeaderboardEntryDto[] }>(
      `/api/leaderboards/horses${limit ? `?limit=${limit}` : ''}`,
    ),
  getRaceLeaderboard: (raceId: string) =>
    apiGet<{ leaderboard: RaceLeaderboardDto }>(`/api/leaderboards/${raceId}`),
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

export interface RaceLeaderboardRowDto {
  rank: number;
  horse: { id: string; name: string };
  jockey: { id: string; fullName: string };
  owner: { id: string; fullName: string };
  finishTime: number | null;
  marginBehind: number | null;
  prize: number;
  isDeadHeat: boolean;
  isDisqualified: boolean;
}

export interface RaceLeaderboardDto {
  raceId: string;
  raceName: string;
  round: number;
  distance: number | null;
  tournamentId: string;
  tournamentName: string | null;
  raceStatus: string;
  stage: 'published' | 'confirmed' | null;
  publishedAt: string | null;
  confirmedAt: string | null;
  rankings: RaceLeaderboardRowDto[];
}
