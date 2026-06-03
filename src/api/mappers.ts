import type { Race, RaceStatus } from '@/mock-data/races';
import type { Invitation, InvitationStatus, JockeyRace } from '@/mock-data/jockey';
import type { SpectatorRaceDto } from './spectator.api';
import type { InvitationDto, JockeyRaceDto } from './jockey.api';

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
      horse: { id: p.id, name: p.name, number: p.laneNumber, breed: '-', color: '#72D79A' },
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
    surface: 'Cỏ',
    purse: myRank?.prize ?? 0,
    myEntry: {
      jockeyId: 'me',
      horse: { name: dto.participant.horse.name, number: dto.participant.laneNumber, color: '#FFB86C' },
      odds: 2.5,
      position: myRank?.rank,
      finishTime: myRank?.finishTime ? `${myRank.finishTime}s` : undefined,
    },
  };
}
