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
    body: 'Trận đấu #1 hôm nay lúc 09:00. Hãy đặt dự đoán ngay!',
    time: '2026-05-27T08:00:00',
    read: false,
  },
  {
    id: 'n4',
    type: 'prediction',
    title: 'Nhắc nhở: Chưa dự đoán trận đấu hôm nay',
    body: 'Còn 2 trận đấu chưa có dự đoán của bạn. Đừng bỏ lỡ!',
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
