import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { jockeyLeaderboard, formatCurrency } from '@/data/mock-data';

const PODIUM_COLORS = [C.secondary, C.onSurfaceVariant, C.primary];
const PODIUM_BG     = [C.secondaryContainer, `${C.onSurfaceVariant}25`, C.primaryContainer];

export function Leaderboard() {
  const top3 = jockeyLeaderboard.slice(0, 3);
  const rest  = jockeyLeaderboard.slice(3);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Podium */}
      <Animated.View entering={FadeInDown.duration(340)} style={styles.podiumRow}>
        {[1, 0, 2].map(i => (
          <View key={i} style={styles.podiumItem}>
            <View style={[styles.podiumAvatar, { backgroundColor: PODIUM_BG[i] }]}>
              <Text style={[styles.podiumRank, { color: PODIUM_COLORS[i] }]}>{i + 1}</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{top3[i].name.split(' ').pop()}</Text>
            <Text style={styles.podiumWins}>{top3[i].wins} thắng</Text>
            <View style={[styles.podiumBase, { height: i === 0 ? 72 : i === 1 ? 56 : 40, backgroundColor: PODIUM_BG[i] }]} />
          </View>
        ))}
      </Animated.View>

      {/* Rest */}
      {rest.map((entry, idx) => (
        <Animated.View key={entry.rank} entering={FadeInDown.delay(idx * 40).duration(280)}>
          <View style={styles.entryRow}>
            <Text style={styles.rank}>{entry.rank}</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{entry.name.charAt(0)}</Text>
            </View>
            <View style={styles.entryInfo}>
              <Text style={styles.entryName}>{entry.name}</Text>
              <Text style={styles.entryMeta}>{entry.wins}W / {entry.races} đua · {entry.winRate.toFixed(0)}%</Text>
            </View>
            <View style={styles.entryRight}>
              <Text style={styles.earnings}>{formatCurrency(entry.earnings)}</Text>
              <View style={styles.changeRow}>
                <MaterialCommunityIcons
                  name={entry.change > 0 ? 'trending-up' : entry.change < 0 ? 'trending-down' : 'minus'}
                  size={12}
                  color={entry.change > 0 ? C.tertiary : entry.change < 0 ? C.error : C.onSurfaceVariant}
                />
                {entry.change !== 0 && (
                  <Text style={[styles.changeText, { color: entry.change > 0 ? C.tertiary : C.error }]}>
                    {Math.abs(entry.change)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },

  podiumRow:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: Spacing.two, marginBottom: Spacing.three },
  podiumItem:  { flex: 1, alignItems: 'center', gap: Spacing.one },
  podiumAvatar:{ width: 48, height: 48, borderRadius: Shape.full, justifyContent: 'center', alignItems: 'center' },
  podiumRank:  { fontFamily: FontFamily.bold, fontSize: 22 },
  podiumName:  { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 11, textAlign: 'center' },
  podiumWins:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  podiumBase:  { width: '100%', borderRadius: Shape.medium },

  entryRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two },
  rank:      { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 14, width: 20, textAlign: 'center' },
  avatar:    { width: 36, height: 36, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  avatarText:{ color: C.primary, fontFamily: FontFamily.bold, fontSize: 14 },
  entryInfo: { flex: 1 },
  entryName: { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  entryMeta: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  entryRight:{ alignItems: 'flex-end', gap: 2 },
  earnings:  { color: C.primary, fontFamily: FontFamily.bold, fontSize: 12 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  changeText:{ fontFamily: FontFamily.medium, fontSize: 10 },
});
