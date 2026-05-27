export type SpectatorUser = {
  name: string;
  initials: string;
  phone: string;
  joinedAt: string;
  stats: {
    totalPredictions: number;
    correctPredictions: number;
    totalPoints: number;
    totalRewards: number;
    winRate: number;
    rank: number;
  };
};

export const currentSpectator: SpectatorUser = {
  name: 'Nguyễn Khán Giả',
  initials: 'KG',
  phone: '0912 345 678',
  joinedAt: '2026-01-15',
  stats: {
    totalPredictions: 5,
    correctPredictions: 2,
    totalPoints: 70_000,
    totalRewards: 700_000,
    winRate: 40,
    rank: 128,
  },
};
