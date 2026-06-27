import type { Race, RaceStatus } from '@/types/race';
import type { Invitation, InvitationStatus, JockeyRace } from '@/mock-data/jockey';
import type { SpectatorRaceDto } from './spectator.api';
import type { InvitationDto, JockeyRaceDto } from './jockey.api';

const LANE_COLORS = [
  '#E05C5C', '#4A9BE5', '#F0B429', '#72D79A', '#C47ED4',
  '#F07250', '#5DC8C8', '#E8A0C0', '#8BC48A', '#7090D0',
];

const HORSE_COLOR_HEX: Record<string, string> = {
  chestnut: '#C07840',
  bay:      '#8B4513',
  black:    '#3D3D3D',
  gray:     '#909090',
  grey:     '#909090',
  white:    '#E8E8D0',
  roan:     '#B87058',
  palomino: '#C8A055',
  dun:      '#C8B060',
  pinto:    '#D4A055',
  sorrel:   '#A0522D',
  buckskin: '#C8A856',
  cremello: '#F5E0C0',
};

function horseColorToHex(colorName?: string): string {
  if (!colorName) return '#72D79A';
  return HORSE_COLOR_HEX[colorName.toLowerCase()] ?? '#72D79A';
}

function mapStatus(status: string): RaceStatus {
  if (status === 'ongoing') return 'live';
  if (status === 'completed') return 'completed';
  return 'upcoming';
}

export function mapSpectatorRace(dto: SpectatorRaceDto): Race {
  const dt = new Date(dto.scheduledAt);
  return {
    id: dto.id,
    name: dto.name,
    number: dto.round,
    status: mapStatus(dto.status),
    date: dt.toISOString().slice(0, 10),
    time: dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    location: dto.tournament.name,
    surface: 'Cỏ',
    track: 'Oval',
    distance: dto.distance ?? 1600,
    laps: 2,
    purse: dto.viewingTicket.pricePoints * 1000,
    entries: dto.participants.map((p, i) => ({
      horse: { id: p.id, name: p.name, number: p.laneNumber, breed: '-', color: LANE_COLORS[(p.laneNumber - 1) % LANE_COLORS.length] },
      jockeyName: '-',
      odds: 2 + i * 0.5,
      position: dto.result?.rankings.find((r) => r.horse.id === p.id)?.rank,
    })),
  };
}

export function mapInvitation(dto: InvitationDto): Invitation {
  const dt = dto.race.scheduledAt ? new Date(dto.race.scheduledAt) : new Date();
  return {
    id: dto.id,
    horse: { name: dto.horse.name, breed: '-', age: 4, color: '#72D79A' },
    race: {
      id: dto.race.id,
      name: dto.race.name,
      date: dt.toISOString().slice(0, 10),
      time: dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      location: '-',
      distance: 1600,
      surface: 'Cỏ',
      purse: 0,
    },
    ownerName: dto.owner.fullName,
    message: dto.message,
    sentAt: dto.createdAt,
    status: dto.status as InvitationStatus,
  };
}

export function mapJockeyRace(dto: JockeyRaceDto): JockeyRace {
  const dt = new Date(dto.scheduledAt);
  const myRank = dto.result?.rankings.find((r) => r.horse.name === dto.participant.horse.name);
  return {
    id: dto.id,
    name: dto.name,
    status: mapStatus(dto.status) as JockeyRace['status'],
    date: dt.toISOString().slice(0, 10),
    time: dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    location: dto.tournament.name,
    distance: dto.distance ?? 1600,
    surface: dto.track?.surface ?? 'Cỏ',
    purse: myRank?.prize ?? 0,
    trackName: dto.track?.name,
    trackLocation: dto.track?.location,
    meetingName: dto.meeting?.name,
    meetingDate: dto.meeting?.date,
    ownerName: dto.participant.owner.fullName,
    myEntry: {
      jockeyId: 'me',
      horse: {
        name: dto.participant.horse.name,
        number: dto.participant.laneNumber,
        color: horseColorToHex(dto.participant.horse.color),
        breed: dto.participant.horse.breed,
        age: dto.participant.horse.age,
        healthStatus: dto.participant.horse.healthStatus,
        registrationId: dto.participant.horse.registrationId,
      },
      odds: 2.5,
      position: myRank?.rank,
      finishTime: myRank?.finishTime ? `${myRank.finishTime}s` : undefined,
    },
  };
}
