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
