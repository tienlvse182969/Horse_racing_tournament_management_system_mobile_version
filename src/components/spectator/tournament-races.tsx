import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { useSpectatorRaces, useSpectatorTournaments } from '@/hooks/useSpectatorData';
import type { Race, RaceStatus } from '@/types/race';
import { RaceCard } from './live/race-card';
import { RaceDetail } from './live/race-detail';

const STATUS_ORDER: RaceStatus[] = ['live', 'upcoming', 'completed'];
const STATUS_LABELS: Record<RaceStatus, string> = {
  live: 'Đang diễn ra',
  upcoming: 'Sắp diễn ra',
  completed: 'Đã kết thúc',
};

type Props = { tournamentId: string };

export function TournamentRaces({ tournamentId }: Props) {
  const { races, loading } = useSpectatorRaces();
  const { tournaments } = useSpectatorTournaments();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const tournament = tournaments.find(t => t.id === tournamentId);
  const tournamentRaces = races.filter(r => r.tournamentId === tournamentId);

  if (selectedRace) {
    return <RaceDetail race={selectedRace} onBack={() => setSelectedRace(null)} />;
  }

  const grouped = STATUS_ORDER.reduce<Record<RaceStatus, Race[]>>((acc, s) => {
    acc[s] = tournamentRaces.filter(r => r.status === s);
    return acc;
  }, { live: [], upcoming: [], completed: [] });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title={tournament?.name ?? 'Trận đấu'}
          contentContainerStyle={styles.scroll}
          leftAction={
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push('/(app)/tournaments' as any)}
              activeOpacity={0.7}>
              <ChevronLeft size={24} color={C.onSurface} />
            </TouchableOpacity>
          }>

          {loading && <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />}

          {!loading && tournamentRaces.length === 0 && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Chưa có trận đấu nào</Text>
            </Animated.View>
          )}

          {STATUS_ORDER.map(status => {
            const group = grouped[status];
            if (group.length === 0) return null;
            return (
              <Animated.View key={status} entering={FadeIn.duration(300)} style={styles.group}>
                <Text style={styles.groupLabel}>{STATUS_LABELS[status]}</Text>
                {group.map(race => (
                  <View key={race.id} style={styles.cardWrap}>
                    <RaceCard race={race} onPress={() => setSelectedRace(race)} />
                  </View>
                ))}
              </Animated.View>
            );
          })}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, paddingBottom: Spacing.five },

  backBtn: {
    width: 34, height: 34, borderRadius: Shape.full,
    backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center',
  },

  group:      { marginBottom: Spacing.three },
  groupLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12, letterSpacing: 0.5, marginBottom: Spacing.two },
  cardWrap:   { marginBottom: Spacing.two },

  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.six },
  emptyText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14 },
});
