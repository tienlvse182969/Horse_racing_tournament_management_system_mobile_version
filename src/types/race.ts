export type RaceStatus = 'live' | 'upcoming' | 'completed';

export type RaceViolation = {
  horseId: string | null;
  horseName: string | null;
  type: string;
  description: string;
  penaltyApplied: string | null;
};

export type RaceEntry = {
  horse: { id: string; name: string; number: number; breed: string; color: string };
  jockeyName: string;
  odds: number;
  ticketCount?: number;
  position?: number;
  finishTime?: string;
  isDisqualified?: boolean;
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
  tournamentId?: string;
  canPredict?: boolean;
  hasPrediction?: boolean;
  resultPublished?: boolean;
  predictionConfig?: { isEnabled: boolean; poolEnabled: boolean; entryFee: number; ticketPrice: number; quickRiskMultipliers: number[] };
  violations?: RaceViolation[];
};
