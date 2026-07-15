// ─── Types ────────────────────────────────────────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export type PenaltyStatus = {
  isBanned: boolean;
  bannedUntil: string | null;
  reason: string | null;
};

export type Invitation = {
  id: string;
  horse: { name: string; breed: string; age: number; color: string; penaltyStatus?: PenaltyStatus };
  race: { id: string; name: string; date: string; time: string; location: string; distance: number; surface: string; purse: number };
  ownerName: string;
  message?: string;
  sentAt: string;
  status: InvitationStatus;
};

export type PersonalResult = {
  raceId: string;
  raceName: string;
  date: string;
  horse: string;
  position: number;
  time: string;
  earnings: number;
};

export type AchievementType = 'gold' | 'silver' | 'bronze' | 'special';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  icon: string;
  earnedAt: string;
};

export type JockeyUser = {
  name: string;
  initials: string;
  licenseNumber: string;
  nationality: string;
  age: number;
  stats: {
    totalRaces: number;
    wins: number;
    seconds: number;
    thirds: number;
    winRate: number;
    earnings: number;
  };
  achievements: Achievement[];
};

export type JockeyRaceEntry = {
  jockeyId: string;
  horse: {
    name: string;
    number: number;
    color: string;
    breed?: string;
    age?: number;
    healthStatus?: string;
    registrationId?: string;
    penaltyStatus?: PenaltyStatus;
  };
  odds: number;
  position?: number;
  finishTime?: string;
};

export type JockeyRaceStatus = 'live' | 'upcoming' | 'completed';

export type JockeyRace = {
  id: string;
  name: string;
  status: JockeyRaceStatus;
  date: string;
  time: string;
  location: string;
  distance: number;
  surface: string;
  purse: number;
  myEntry: JockeyRaceEntry;
  ownerName?: string;
  fullRaceId?: string;
  trackName?: string;
  trackLocation?: string;
  meetingName?: string;
  meetingDate?: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

export const currentJockey: JockeyUser = {
  name: 'Nguyễn Minh Tuấn',
  initials: 'MT',
  licenseNumber: 'JKY-2024-001',
  nationality: 'Việt Nam',
  age: 28,
  stats: {
    totalRaces: 124,
    wins: 38,
    seconds: 27,
    thirds: 19,
    winRate: 30.6,
    earnings: 4_800_000_000,
  },
  achievements: [
    { id: 'a1', title: 'Vô Địch Quốc Gia', description: '1st Place - Giải VĐQG 2025', type: 'gold', icon: 'trophy', earnedAt: '2025-12-15' },
    { id: 'a2', title: 'Hat-trick Chiến Thắng', description: '3 thắng liên tiếp', type: 'gold', icon: 'target', earnedAt: '2025-10-08' },
    { id: 'a3', title: 'Jockey Xuất Sắc', description: 'Tháng 11/2025', type: 'silver', icon: 'star', earnedAt: '2025-11-30' },
    { id: 'a4', title: 'Tốc Độ Thần Sầu', description: 'Thành tích 1:15.2 kỷ lục đường đua', type: 'special', icon: 'lightning-bolt', earnedAt: '2025-09-14' },
    { id: 'a5', title: 'Top 10 Jockey', description: 'Bảng xếp hạng Đông Nam Á', type: 'silver', icon: 'star-four-points', earnedAt: '2025-08-20' },
    { id: 'a6', title: 'Vô Địch Cúp Vàng', description: '1st Place - Cúp Vàng 2024', type: 'gold', icon: 'trophy-variant', earnedAt: '2024-12-20' },
  ],
};

export const invitations: Invitation[] = [
  {
    id: 'inv1',
    horse: { name: 'Thiên Mã Vàng', breed: 'Thoroughbred', age: 5, color: '#FFB86C' },
    race: { id: 'jr1', name: 'Giải Vô Địch Mùa Xuân', date: '2026-05-25', time: '09:00', location: 'Trường đua Phú Thọ', distance: 1600, surface: 'Cỏ', purse: 500_000_000 },
    ownerName: 'Nguyễn Văn An',
    message: '"Thiên Mã Vàng đang trong phong độ tốt nhất! Mong bạn đồng hành."',
    sentAt: '2026-05-23T08:00:00',
    status: 'pending',
  },
  {
    id: 'inv2',
    horse: { name: 'Phi Vũ', breed: 'Arabian', age: 4, color: '#72D79A' },
    race: { id: 'jr2', name: 'Giải Mùa Hè Rực Rỡ', date: '2026-06-01', time: '08:30', location: 'Trường đua Hà Nội', distance: 1800, surface: 'Cỏ', purse: 450_000_000 },
    ownerName: 'Trần Thị Bình',
    message: '"Phi Vũ có tốc độ xuất sắc ở cự ly này, rất phù hợp với phong cách của bạn."',
    sentAt: '2026-05-24T10:00:00',
    status: 'pending',
  },
  {
    id: 'inv3',
    horse: { name: 'Thiên Mã Vàng', breed: 'Thoroughbred', age: 5, color: '#FFB86C' },
    race: { id: 'jr3', name: 'Cúp Đông Nam Á', date: '2026-06-08', time: '10:00', location: 'Trường đua Phú Thọ', distance: 2400, surface: 'Cỏ', purse: 1_000_000_000 },
    ownerName: 'Nguyễn Văn An',
    sentAt: '2026-05-20T10:00:00',
    status: 'accepted',
  },
  {
    id: 'inv4',
    horse: { name: 'Hồng Phong', breed: 'Thoroughbred', age: 6, color: '#FF6B6B' },
    race: { id: 'jr4', name: 'Giải Tranh Cúp Vàng', date: '2026-05-24', time: '14:00', location: 'Trường đua Bình Dương', distance: 1200, surface: 'Cỏ', purse: 200_000_000 },
    ownerName: 'Lê Quốc Hùng',
    sentAt: '2026-05-18T09:00:00',
    status: 'accepted',
  },
  {
    id: 'inv5',
    horse: { name: 'Tuyết Hoa', breed: 'Arabian', age: 3, color: '#A0C4FF' },
    race: { id: 'jr5', name: 'Giải Trẻ Tài Năng', date: '2026-05-24', time: '14:00', location: 'Trường đua Đại Nam', distance: 1000, surface: 'Đất', purse: 80_000_000 },
    ownerName: 'Phạm Thanh Tùng',
    sentAt: '2026-05-19T14:00:00',
    status: 'declined',
  },
];

export const jockeyRaces: JockeyRace[] = [
  {
    id: 'jr1',
    name: 'Giải Vô Địch Mùa Xuân',
    status: 'upcoming',
    date: '2026-05-25',
    time: '09:00',
    location: 'Trường đua Phú Thọ',
    distance: 1600,
    surface: 'Cỏ',
    purse: 500_000_000,
    myEntry: { jockeyId: 'j1', horse: { name: 'Thiên Mã Vàng', number: 1, color: '#FFB86C' }, odds: 2.5 },
  },
  {
    id: 'jr2',
    name: 'Cúp Ngọc Trai',
    status: 'live',
    date: '2026-05-25',
    time: '11:30',
    location: 'Trường đua Phú Thọ',
    distance: 2000,
    surface: 'Cỏ',
    purse: 300_000_000,
    myEntry: { jockeyId: 'j1', horse: { name: 'Phi Vũ', number: 6, color: '#72D79A' }, odds: 1.8, position: 1 },
  },
  {
    id: 'jr3',
    name: 'Cúp Đông Nam Á',
    status: 'upcoming',
    date: '2026-06-08',
    time: '10:00',
    location: 'Trường đua Phú Thọ',
    distance: 2400,
    surface: 'Cỏ',
    purse: 1_000_000_000,
    myEntry: { jockeyId: 'j1', horse: { name: 'Thiên Mã Vàng', number: 3, color: '#FFB86C' }, odds: 2.1 },
  },
  {
    id: 'jr4',
    name: 'Giải Tranh Cúp Vàng',
    status: 'completed',
    date: '2026-05-24',
    time: '14:00',
    location: 'Trường đua Bình Dương',
    distance: 1200,
    surface: 'Cỏ',
    purse: 200_000_000,
    myEntry: { jockeyId: 'j1', horse: { name: 'Hồng Phong', number: 3, color: '#FF6B6B' }, odds: 3.1, position: 1, finishTime: '1:18.4' },
  },
  {
    id: 'jr5',
    name: 'Giải Mùa Hè Rực Rỡ',
    status: 'upcoming',
    date: '2026-06-01',
    time: '08:30',
    location: 'Trường đua Hà Nội',
    distance: 1800,
    surface: 'Cỏ',
    purse: 450_000_000,
    myEntry: { jockeyId: 'j1', horse: { name: 'Phi Vũ', number: 4, color: '#72D79A' }, odds: 2.8 },
  },
  {
    id: 'jr6',
    name: 'Giải Mùa Hè Phú Thọ',
    status: 'upcoming',
    date: '2026-06-06',
    time: '10:30',
    location: 'Trường đua Phú Thọ',
    distance: 1200,
    surface: 'Cỏ',
    purse: 300_000_000,
    fullRaceId: 'r2',
    trackName: 'Trường đua Phú Thọ',
    trackLocation: 'Quận 11, Thành phố Hồ Chí Minh',
    meetingName: 'Ngày đua Mùa Hè 2026 - Vòng 3',
    meetingDate: '2026-06-06',
    myEntry: { jockeyId: 'j1', horse: { name: 'Bão Lửa', number: 2, color: '#FF6B6B' }, odds: 2.1 },
  },
  {
    id: 'jr7',
    name: 'Giải Mùa Hè Phú Thọ',
    status: 'live',
    date: '2026-06-06',
    time: '10:30',
    location: 'Trường đua Phú Thọ',
    distance: 1200,
    surface: 'Cỏ',
    purse: 300_000_000,
    fullRaceId: 'r2',
    trackName: 'Trường đua Phú Thọ',
    trackLocation: 'Quận 11, Thành phố Hồ Chí Minh',
    meetingName: 'Ngày đua Mùa Hè 2026 - Vòng 3',
    meetingDate: '2026-06-06',
    myEntry: { jockeyId: 'j1', horse: { name: 'Bão Lửa', number: 2, color: '#FF6B6B' }, odds: 2.1, position: 2 },
  },
];

export const personalResults: PersonalResult[] = [
  { raceId: 'jr4', raceName: 'Giải Tranh Cúp Vàng',  date: '2026-05-24', horse: 'Hồng Phong',   position: 1, time: '1:18.4', earnings: 100_000_000 },
  { raceId: 'pr2', raceName: 'Giải Tốc Độ Tháng 5',  date: '2026-05-18', horse: 'Thiên Mã Vàng', position: 2, time: '1:22.1', earnings: 50_000_000 },
  { raceId: 'pr3', raceName: 'Cúp Khai Xuân',          date: '2026-05-10', horse: 'Thiên Mã Vàng', position: 1, time: '1:19.8', earnings: 120_000_000 },
  { raceId: 'pr4', raceName: 'Giải Vô Địch Tỉnh',      date: '2026-05-03', horse: 'Phi Vũ',         position: 3, time: '1:21.5', earnings: 30_000_000 },
  { raceId: 'pr5', raceName: 'Cúp Mùa Xuân 2026',      date: '2026-04-26', horse: 'Long Thần',      position: 1, time: '1:20.2', earnings: 90_000_000 },
];

