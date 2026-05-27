import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { AvatarTabButton } from '@/components/avatar-tab-button';
import { races } from '@/mock-data';
import type { Race, RaceStatus } from '@/mock-data';
import { RaceCard } from './race-card';
import { RaceDetail } from './race-detail';
import { Leaderboard } from './leaderboard';

type MainTab = 'races' | 'leaderboard';
type FilterStatus = 'all' | RaceStatus;

const STATUS_ORDER: RaceStatus[] = ['live', 'upcoming', 'completed'];
const STATUS_LABELS: Record<RaceStatus, string> = {
  live: 'Đang diễn ra',
  upcoming: 'Sắp diễn ra',
  completed: 'Đã kết thúc',
};

export function SpectatorLive() {
  const [tab, setTab]               = useState<MainTab>('races');
  const [filter, setFilter]         = useState<FilterStatus>('all');
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const handleBack = useCallback(() => setSelectedRace(null), []);

  if (selectedRace) {
    return <RaceDetail race={selectedRace} onBack={handleBack} />;
  }

  const filtered = filter === 'all' ? races : races.filter(r => r.status === filter);

  const grouped = STATUS_ORDER.reduce<Record<RaceStatus, Race[]>>((acc, s) => {
    acc[s] = filtered.filter(r => r.status === s);
    return acc;
  }, { live: [], upcoming: [], completed: [] });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Trực tiếp" contentContainerStyle={styles.scroll} rightAction={<AvatarTabButton />}>

          {/* Tab switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'races' && styles.tabBtnActive]}
              onPress={() => setTab('races')}
              activeOpacity={0.8}>
              <Text style={[styles.tabBtnText, tab === 'races' && styles.tabBtnTextActive]}>Trận đấu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'leaderboard' && styles.tabBtnActive]}
              onPress={() => setTab('leaderboard')}
              activeOpacity={0.8}>
              <Text style={[styles.tabBtnText, tab === 'leaderboard' && styles.tabBtnTextActive]}>Bảng XH</Text>
            </TouchableOpacity>
          </View>

          {tab === 'races' && (
            <>
              {/* Filter chips */}
              <View style={styles.filterRow}>
                {(['all', 'live', 'upcoming', 'completed'] as FilterStatus[]).map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, filter === f && styles.filterChipActive]}
                    onPress={() => setFilter(f)}
                    activeOpacity={0.75}>
                    <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                      {f === 'all' ? 'Tất cả' : STATUS_LABELS[f as RaceStatus]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

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
            </>
          )}

          {tab === 'leaderboard' && <Leaderboard standalone={false} />}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, paddingBottom: Spacing.five },

  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: SC.base,
    marginBottom: Spacing.three,
    borderRadius: Shape.full,
    padding: 4,
  },
  tabBtn:          { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Shape.full },
  tabBtnActive:    { backgroundColor: C.tertiary },
  tabBtnText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 14 },
  tabBtnTextActive:{ color: C.onTertiary },

  filterRow:            { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.two, flexWrap: 'wrap' },
  filterChip:           { backgroundColor: SC.high, borderRadius: Shape.full, paddingHorizontal: 12, paddingVertical: 6 },
  filterChipActive:     { backgroundColor: C.tertiaryContainer },
  filterChipText:       { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12 },
  filterChipTextActive: { color: C.onTertiaryContainer },

  group:      { marginBottom: Spacing.three },
  groupLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12, letterSpacing: 0.5, marginBottom: Spacing.two },
  cardWrap:   { marginBottom: Spacing.two },
});
