import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { MedalIcon } from '@/components/ui/medal-icon';
import type { StandingEntry, RaceState } from './live-viewer';

type Props = { standings: StandingEntry[]; raceState: RaceState };

export function LiveStandings({ standings, raceState }: Props) {
  if (raceState === 'finished') {
    return <FinishedPodium standings={standings} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>THỨ HẠNG</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {standings.map((s) => (
          <StandingRow key={s.entry.horse.id} s={s} />
        ))}
      </ScrollView>
    </View>
  );
}

function StandingRow({ s }: { s: StandingEntry }) {
  const delta = s.previousRank - s.rank;
  return (
    <Animated.View entering={FadeInDown.duration(200)} style={styles.row}>
      <View style={styles.rankWrap}>
        <Text style={styles.rankNum}>{s.rank}</Text>
      </View>
      <View style={[styles.colorDot, { backgroundColor: s.entry.horse.color }]} />
      <View style={styles.info}>
        <Text style={styles.horseName} numberOfLines={1}>
          #{s.entry.horse.number} {s.entry.horse.name}
        </Text>
        <Text style={styles.jockeyName} numberOfLines={1}>{s.entry.jockeyName}</Text>
      </View>
      <View style={styles.right}>
        {s.finishTime
          ? <Text style={styles.finishTime}>{s.finishTime}</Text>
          : <Text style={styles.odds}>{s.entry.odds.toFixed(1)}x</Text>}
        <TrendIcon delta={delta} />
      </View>
    </Animated.View>
  );
}

function TrendIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp size={12} color={C.tertiary} />;
  if (delta < 0) return <TrendingDown size={12} color={C.error} />;
  return <Minus size={12} color={C.onSurfaceVariant} />;
}

function FinishedPodium({ standings }: { standings: StandingEntry[] }) {
  // Sort by progress desc so partial-finishers are ranked correctly
  const sorted = [...standings].sort((a, b) => b.progress - a.progress);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>KẾT QUẢ CHUNG CUỘC</Text>
      <View style={styles.podiumRow}>
        {[top3[1], top3[0], top3[2]].map((s, displayIdx) => {
          if (!s) return null;
          const posLabel = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
          const heights = [80, 100, 60];
          return (
            <View key={s.entry.horse.id} style={styles.podiumItem}>
              <View style={[styles.podiumDot, { backgroundColor: s.entry.horse.color }]}>
                <Text style={styles.podiumEmoji}>🐎</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{s.entry.horse.name}</Text>
              {s.finishTime && <Text style={styles.podiumTime}>{s.finishTime}</Text>}
              <View style={[styles.podiumBlock, { height: heights[displayIdx], backgroundColor: SC.highest }]}>
                <MedalIcon position={posLabel} size={22} />
              </View>
            </View>
          );
        })}
      </View>
      <ScrollView style={styles.restList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {rest.map(s => (
          <View key={s.entry.horse.id} style={styles.restRow}>
            <Text style={styles.restRank}>{s.rank}</Text>
            <View style={[styles.colorDot, { backgroundColor: s.entry.horse.color }]} />
            <Text style={styles.restName} numberOfLines={1}>#{s.entry.horse.number} {s.entry.horse.name}</Text>
            <Text style={styles.finishTime}>{s.finishTime ?? '—'}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  sectionTitle: { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 11, letterSpacing: 0.8, marginBottom: Spacing.two },
  list:         { flex: 1 },

  row:       { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.medium, paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, marginBottom: 4, gap: Spacing.two },
  rankWrap:  { width: 20, alignItems: 'center' },
  rankNum:   { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 13 },
  colorDot:  { width: 10, height: 10, borderRadius: 5 },
  info:      { flex: 1 },
  horseName: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },
  jockeyName:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  right:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  odds:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  finishTime:{ color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 12 },

  // Podium
  podiumRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: Spacing.two, marginBottom: Spacing.two },
  podiumItem:  { flex: 1, alignItems: 'center', gap: 4 },
  podiumDot:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  podiumEmoji: { fontSize: 22 },
  podiumName:  { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 11, textAlign: 'center' },
  podiumTime:  { color: C.tertiary, fontFamily: FontFamily.medium, fontSize: 10 },
  podiumBlock: { width: '100%', borderRadius: Shape.small, justifyContent: 'center', alignItems: 'center' },

  restList: { flex: 1 },
  restRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one },
  restRank: { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 12, width: 20, textAlign: 'center' },
  restName: { flex: 1, color: C.onSurface, fontFamily: FontFamily.regular, fontSize: 12 },
});
