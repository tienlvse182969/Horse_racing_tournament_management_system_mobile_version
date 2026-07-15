import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { useHorseLeaderboard } from '@/hooks/useHorseLeaderboard';
import { MedalIcon } from '@/components/ui/medal-icon';

const PODIUM_COLORS = [C.secondary, C.onSurfaceVariant, C.primary];
const PODIUM_BG     = [C.secondaryContainer, `${C.onSurfaceVariant}25`, C.primaryContainer];

export function Leaderboard({ standalone = true }: { standalone?: boolean }) {
  const { entries, loading } = useHorseLeaderboard(10);
  const top3 = entries.slice(0, 3);

  const content = (
    <>
      {!loading && entries.length === 0 && (
        <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
      )}

      {/* Podium */}
      {top3.length > 0 && (
        <Animated.View entering={FadeInDown.duration(340)} style={styles.podiumRow}>
          {[1, 0, 2].map(i => top3[i] ? (
            <View key={i} style={styles.podiumItem}>
              <View style={[styles.podiumAvatar, { backgroundColor: PODIUM_BG[i] }]}>
                <Text style={[styles.podiumRank, { color: PODIUM_COLORS[i] }]}>{i + 1}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{top3[i].horseName}</Text>
              <Text style={styles.podiumWins}>{top3[i].firstPlaceWins} thắng</Text>
              <View style={[styles.podiumBase, { height: i === 0 ? 72 : i === 1 ? 56 : 40, backgroundColor: PODIUM_BG[i] }]} />
            </View>
          ) : <View key={i} style={styles.podiumItem} />)}
        </Animated.View>
      )}

      {/* Full ranking list */}
      {entries.map((entry, idx) => (
        <Animated.View key={entry.horseId} entering={FadeInDown.delay(idx * 40).duration(280)}>
          <View style={styles.entryRow}>
            <View style={styles.rank}>
              {entry.rank <= 3
                ? <MedalIcon position={entry.rank} size={16} />
                : <Text style={styles.rankText}>{entry.rank}</Text>}
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{entry.horseName.charAt(0)}</Text>
            </View>
            <View style={styles.entryInfo}>
              <Text style={styles.entryName}>{entry.horseName}</Text>
              <Text style={styles.entryMeta}>{entry.firstPlaceWins}W / {entry.totalPublishedRaces} đua · {entry.winRate.toFixed(0)}%</Text>
            </View>
            <View style={styles.entryRight}>
              <Text style={styles.winRate}>{entry.winRate.toFixed(0)}%</Text>
              {(entry.ownerName ?? entry.latestRaceName) && (
                <Text style={styles.entrySubtitle} numberOfLines={1}>
                  {entry.ownerName ? `Chủ: ${entry.ownerName}` : entry.latestRaceName}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>
      ))}
    </>
  );

  if (standalone) {
    return (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.inlineContent}>{content}</View>;
}

const styles = StyleSheet.create({
  scroll:         { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },
  inlineContent:  { gap: Spacing.two },

  podiumRow:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: Spacing.two, marginBottom: Spacing.three },
  podiumItem:  { flex: 1, alignItems: 'center', gap: Spacing.one },
  podiumAvatar:{ width: 48, height: 48, borderRadius: Shape.full, justifyContent: 'center', alignItems: 'center' },
  podiumRank:  { fontFamily: FontFamily.bold, fontSize: 22 },
  podiumName:  { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 11, textAlign: 'center' },
  podiumWins:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  podiumBase:  { width: '100%', borderRadius: Shape.medium },

  entryRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two },
  rank:      { width: 20, alignItems: 'center' },
  rankText:  { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 14, textAlign: 'center' },
  avatar:    { width: 36, height: 36, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  avatarText:{ color: C.primary, fontFamily: FontFamily.bold, fontSize: 14 },
  entryInfo: { flex: 1 },
  entryName: { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  entryMeta: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  entryRight:{ alignItems: 'flex-end', gap: 2, maxWidth: 110 },
  winRate:      { color: C.primary, fontFamily: FontFamily.bold, fontSize: 13 },
  entrySubtitle:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  emptyText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, textAlign: 'center', paddingVertical: Spacing.four },
});
