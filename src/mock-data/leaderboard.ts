export type JockeyEntry = {
  rank: number;
  name: string;
  wins: number;
  races: number;
  winRate: number;
  earnings: number;
  change: number;
};

export const jockeyLeaderboard: JockeyEntry[] = [
  { rank: 1, name: 'Nguyễn Văn Sơn',   wins: 12, races: 18, winRate: 66.7, earnings: 4_500_000_000, change: 0  },
  { rank: 2, name: 'Trần Bảo Long',    wins: 10, races: 16, winRate: 62.5, earnings: 3_800_000_000, change: 1  },
  { rank: 3, name: 'Nguyễn Minh Tuấn', wins: 9,  races: 15, winRate: 60.0, earnings: 3_200_000_000, change: -1 },
  { rank: 4, name: 'Lê Quang Vinh',    wins: 8,  races: 14, winRate: 57.1, earnings: 2_700_000_000, change: 2  },
  { rank: 5, name: 'Vũ Thành Nam',     wins: 7,  races: 13, winRate: 53.8, earnings: 2_100_000_000, change: 0  },
  { rank: 6, name: 'Trần Văn Hùng',    wins: 6,  races: 12, winRate: 50.0, earnings: 1_800_000_000, change: -2 },
  { rank: 7, name: 'Phạm Duy Tân',     wins: 5,  races: 11, winRate: 45.5, earnings: 1_400_000_000, change: 1  },
  { rank: 8, name: 'Đỗ Minh Khoa',     wins: 4,  races: 10, winRate: 40.0, earnings: 900_000_000,   change: 0  },
];
