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
    date: '2026-06-06',
    time: '10:30',
    location: 'Trường đua Phú Thọ',
    surface: 'Cỏ',
    track: 'Oval',
    distance: 1200,
    laps: 1,
    purse: 300_000_000,
    entries: [
      { horse: { id: 'h6', name: 'Bão Lửa', number: 2, breed: 'Thoroughbred', color: '#FF6B6B' }, jockeyName: 'Nguyễn Minh Tuấn', odds: 2.1 },
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
    date: '2026-06-07',
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
    date: '2026-06-08',
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
