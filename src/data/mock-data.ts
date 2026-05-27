export type RaceStatus = 'live' | 'upcoming' | 'completed';

export type RaceEntry = {
  horse: { id: string; name: string; number: number; breed: string; color: string };
  jockeyName: string;
  odds: number;
  position?: number;
  finishTime?: string;
};

export type Race = {
  id: string;
  name: string;
  number: number;
  status: RaceStatus;
  date: string;
  time: string;
  location: string;
  surface: string;
  track: string;
  distance: number;
  laps: number;
  purse: number;
  entries: RaceEntry[];
};

export type NotificationType = 'reward' | 'result' | 'prediction' | 'tournament' | 'system';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  reward?: number;
};

export type Prediction = {
  id: string;
  raceId: string;
  raceName: string;
  raceDate: string;
  predictedHorseId: string;
  predictedHorseName: string;
  predictedHorseNumber: number;
  status: 'won' | 'lost' | 'pending';
  madeAt: string;
  reward?: number;
  points?: number;
  actualWinner?: string;
};

export type JockeyEntry = {
  rank: number;
  name: string;
  wins: number;
  races: number;
  winRate: number;
  earnings: number;
  change: number;
};

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

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}tỷ`;
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}tr`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return `${amount}`;
}

export function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

export const races: Race[] = [
  {
    id: 'r1',
    name: 'Cúp Vàng Mùa Xuân',
    number: 1,
    status: 'live',
    date: '2026-05-27',
    time: '09:00',
    location: 'Trường đua Phú Thọ',
    surface: 'Cỏ',
    track: 'Oval',
    distance: 1600,
    laps: 2,
    purse: 500_000_000,
    entries: [
      { horse: { id: 'h1', name: 'Tia Chớp Vàng', number: 3, breed: 'Thoroughbred', color: '#FFB86C' }, jockeyName: 'Nguyễn Minh Tuấn', odds: 2.4, position: 1 },
      { horse: { id: 'h2', name: 'Gió Bắc', number: 7, breed: 'Arabian', color: '#72D79A' }, jockeyName: 'Trần Văn Hùng', odds: 3.1, position: 2 },
      { horse: { id: 'h3', name: 'Sấm Rồng', number: 1, breed: 'Thoroughbred', color: '#FFCB66' }, jockeyName: 'Lê Quang Vinh', odds: 4.5, position: 3 },
      { horse: { id: 'h4', name: 'Ngọc Trai', number: 5, breed: 'Warmblood', color: '#A0C4FF' }, jockeyName: 'Phạm Duy Tân', odds: 6.2, position: 4 },
      { horse: { id: 'h5', name: 'Huyền Long', number: 9, breed: 'Quarter Horse', color: '#C77DFF' }, jockeyName: 'Hoàng Đức Mạnh', odds: 8.0, position: 5 },
    ],
  },
  {
    id: 'r2',
    name: 'Giải Mùa Hè Phú Thọ',
    number: 2,
    status: 'upcoming',
    date: '2026-05-27',
    time: '10:30',
    location: 'Trường đua Phú Thọ',
    surface: 'Cỏ',
    track: 'Oval',
    distance: 1200,
    laps: 1,
    purse: 300_000_000,
    entries: [
      { horse: { id: 'h6', name: 'Bão Lửa', number: 2, breed: 'Thoroughbred', color: '#FF6B6B' }, jockeyName: 'Vũ Thành Nam', odds: 2.1 },
      { horse: { id: 'h7', name: 'Tinh Tú', number: 4, breed: 'Arabian', color: '#4ECDC4' }, jockeyName: 'Đỗ Minh Khoa', odds: 3.5 },
      { horse: { id: 'h8', name: 'Kim Cương', number: 6, breed: 'Thoroughbred', color: '#45B7D1' }, jockeyName: 'Bùi Văn Long', odds: 5.0 },
      { horse: { id: 'h9', name: 'Ánh Bình Minh', number: 8, breed: 'Warmblood', color: '#F9CA24' }, jockeyName: 'Nguyễn Hữu Phúc', odds: 7.5 },
    ],
  },
  {
    id: 'r3',
    name: 'Cúp Bạch Kim',
    number: 3,
    status: 'upcoming',
    date: '2026-05-27',
    time: '13:00',
    location: 'Trường đua Phú Thọ',
    surface: 'Đất',
    track: 'Straight',
    distance: 2000,
    laps: 2,
    purse: 800_000_000,
    entries: [
      { horse: { id: 'h10', name: 'Thần Phong', number: 1, breed: 'Thoroughbred', color: '#6C5CE7' }, jockeyName: 'Trương Văn Đức', odds: 1.9 },
      { horse: { id: 'h11', name: 'Mây Trắng', number: 3, breed: 'Arabian', color: '#DCDDE1' }, jockeyName: 'Lâm Thành Đạt', odds: 2.8 },
      { horse: { id: 'h12', name: 'Hoàng Kim', number: 5, breed: 'Quarter Horse', color: '#F0932B' }, jockeyName: 'Phan Minh Nhật', odds: 4.2 },
      { horse: { id: 'h13', name: 'Đêm Trăng', number: 7, breed: 'Warmblood', color: '#A29BFE' }, jockeyName: 'Cao Việt Anh', odds: 9.0 },
    ],
  },
  {
    id: 'r4',
    name: 'Đua Ngựa Truyền Thống',
    number: 4,
    status: 'upcoming',
    date: '2026-05-28',
    time: '09:30',
    location: 'Trường đua Đại Nam',
    surface: 'Cỏ',
    track: 'Oval',
    distance: 1400,
    laps: 2,
    purse: 250_000_000,
    entries: [
      { horse: { id: 'h14', name: 'Lửa Thiêng', number: 2, breed: 'Thoroughbred', color: '#E17055' }, jockeyName: 'Đinh Văn Tú', odds: 3.3 },
      { horse: { id: 'h15', name: 'Sóng Biển', number: 4, breed: 'Arabian', color: '#0984E3' }, jockeyName: 'Mai Xuân Trường', odds: 2.6 },
      { horse: { id: 'h16', name: 'Phượng Hoàng', number: 6, breed: 'Thoroughbred', color: '#FDCB6E' }, jockeyName: 'Dương Quang Hải', odds: 5.5 },
    ],
  },
  {
    id: 'r5',
    name: 'Giải Vô Địch Quốc Gia 2026',
    number: 5,
    status: 'completed',
    date: '2026-05-25',
    time: '15:00',
    location: 'Trường đua Phú Thọ',
    surface: 'Cỏ',
    track: 'Oval',
    distance: 2400,
    laps: 3,
    purse: 2_000_000_000,
    entries: [
      { horse: { id: 'h17', name: 'Thiên Mã', number: 5, breed: 'Thoroughbred', color: '#FFB86C' }, jockeyName: 'Nguyễn Văn Sơn', odds: 2.2, position: 1, finishTime: '2:28.3' },
      { horse: { id: 'h18', name: 'Rồng Vàng', number: 2, breed: 'Arabian', color: '#F9CA24' }, jockeyName: 'Trần Bảo Long', odds: 3.4, position: 2, finishTime: '2:29.1' },
      { horse: { id: 'h19', name: 'Bạch Mã', number: 8, breed: 'Thoroughbred', color: '#DCDDE1' }, jockeyName: 'Lê Minh Đức', odds: 4.7, position: 3, finishTime: '2:30.5' },
      { horse: { id: 'h20', name: 'Đen Tuyền', number: 1, breed: 'Quarter Horse', color: '#2D3436' }, jockeyName: 'Phạm Quốc Bảo', odds: 6.0, position: 4, finishTime: '2:31.9' },
    ],
  },
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'reward',
    title: 'Bạn đã nhận được phần thưởng!',
    body: 'Dự đoán đúng "Thiên Mã" thắng Giải Vô Địch 2026. Thưởng +50,000 điểm',
    time: '2026-05-25T15:45:00',
    read: false,
    reward: 500_000,
  },
  {
    id: 'n2',
    type: 'result',
    title: 'Kết quả: Giải Vô Địch Quốc Gia 2026',
    body: '1. Thiên Mã (2:28.3) — 2. Rồng Vàng — 3. Bạch Mã',
    time: '2026-05-25T15:30:00',
    read: false,
  },
  {
    id: 'n3',
    type: 'tournament',
    title: 'Giải Cúp Vàng Mùa Xuân sắp bắt đầu!',
    body: 'Cuộc đua #1 hôm nay lúc 09:00. Hãy đặt dự đoán ngay!',
    time: '2026-05-27T08:00:00',
    read: false,
  },
  {
    id: 'n4',
    type: 'prediction',
    title: 'Nhắc nhở: Chưa dự đoán cuộc đua hôm nay',
    body: 'Còn 2 cuộc đua chưa có dự đoán của bạn. Đừng bỏ lỡ!',
    time: '2026-05-27T07:30:00',
    read: true,
  },
  {
    id: 'n5',
    type: 'result',
    title: 'Kết quả: Cúp Bạch Kim vòng loại',
    body: 'Kết quả chính thức đã được công bố. Xem ngay!',
    time: '2026-05-24T16:00:00',
    read: true,
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Chào mừng đến RaceTrack VN!',
    body: 'Theo dõi đua ngựa trực tiếp, dự đoán và nhận thưởng hấp dẫn.',
    time: '2026-05-20T09:00:00',
    read: true,
  },
];

export const predictions: Prediction[] = [
  {
    id: 'p1',
    raceId: 'r5',
    raceName: 'Giải Vô Địch Quốc Gia 2026',
    raceDate: '2026-05-25',
    predictedHorseId: 'h17',
    predictedHorseName: 'Thiên Mã',
    predictedHorseNumber: 5,
    status: 'won',
    madeAt: '2026-05-25T10:00:00',
    reward: 500_000,
    points: 50_000,
    actualWinner: 'Thiên Mã',
  },
  {
    id: 'p2',
    raceId: 'r1',
    raceName: 'Cúp Vàng Mùa Xuân',
    raceDate: '2026-05-27',
    predictedHorseId: 'h1',
    predictedHorseName: 'Tia Chớp Vàng',
    predictedHorseNumber: 3,
    status: 'pending',
    madeAt: '2026-05-27T08:30:00',
    points: 0,
  },
  {
    id: 'p3',
    raceId: 'r2',
    raceName: 'Giải Mùa Hè Phú Thọ',
    raceDate: '2026-05-27',
    predictedHorseId: 'h7',
    predictedHorseName: 'Tinh Tú',
    predictedHorseNumber: 4,
    status: 'pending',
    madeAt: '2026-05-27T08:45:00',
    points: 0,
  },
  {
    id: 'p4',
    raceId: 'r5',
    raceName: 'Cúp Bạch Kim (Vòng loại)',
    raceDate: '2026-05-24',
    predictedHorseId: 'h18',
    predictedHorseName: 'Rồng Vàng',
    predictedHorseNumber: 2,
    status: 'lost',
    madeAt: '2026-05-24T09:00:00',
    actualWinner: 'Thiên Mã',
  },
  {
    id: 'p5',
    raceId: 'r3',
    raceName: 'Đua Mùa Thu 2026',
    raceDate: '2026-05-20',
    predictedHorseId: 'h10',
    predictedHorseName: 'Thần Phong',
    predictedHorseNumber: 1,
    status: 'won',
    madeAt: '2026-05-20T08:00:00',
    reward: 200_000,
    points: 20_000,
    actualWinner: 'Thần Phong',
  },
];

export const jockeyLeaderboard: JockeyEntry[] = [
  { rank: 1, name: 'Nguyễn Văn Sơn',  wins: 12, races: 18, winRate: 66.7, earnings: 4_500_000_000, change: 0  },
  { rank: 2, name: 'Trần Bảo Long',   wins: 10, races: 16, winRate: 62.5, earnings: 3_800_000_000, change: 1  },
  { rank: 3, name: 'Nguyễn Minh Tuấn',wins: 9,  races: 15, winRate: 60.0, earnings: 3_200_000_000, change: -1 },
  { rank: 4, name: 'Lê Quang Vinh',   wins: 8,  races: 14, winRate: 57.1, earnings: 2_700_000_000, change: 2  },
  { rank: 5, name: 'Vũ Thành Nam',    wins: 7,  races: 13, winRate: 53.8, earnings: 2_100_000_000, change: 0  },
  { rank: 6, name: 'Trần Văn Hùng',   wins: 6,  races: 12, winRate: 50.0, earnings: 1_800_000_000, change: -2 },
  { rank: 7, name: 'Phạm Duy Tân',    wins: 5,  races: 11, winRate: 45.5, earnings: 1_400_000_000, change: 1  },
  { rank: 8, name: 'Đỗ Minh Khoa',    wins: 4,  races: 10, winRate: 40.0, earnings: 900_000_000,   change: 0  },
];

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
