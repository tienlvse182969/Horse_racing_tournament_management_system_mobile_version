import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Clock, MapPin, Route, Trophy, User } from 'lucide-react-native';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import type { Race } from '@/types/race';
import { formatCurrency, formatDate } from '@/utils/format';

type Props = { race: Race; onPress: () => void };

const MEDAL_COLORS = ['#C9971C', '#C0C0C0', '#CD7F32'];

export function RaceCard({ race, onPress }: Props) {
  const styles = useThemedStyles(createStyles);
  const leader = race.entries.find(e => e.position === 1);

  if (race.status === 'live') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={['#003520', '#1A5C3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.liveCard}>
          <View style={styles.cardHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>ĐANG ĐUA</Text>
            </View>
            <Text style={[styles.cardNumber, { color: 'rgba(255,255,255,0.5)' }]}>#{race.number}</Text>
          </View>
          <Text style={styles.liveCardName}>{race.name}</Text>
          <Text style={styles.liveCardMeta}>
            {race.location} · {race.distance}m · {race.laps} vòng
          </Text>
          <View style={styles.liveSeparator} />
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Giải thưởng</Text>
              <Text style={styles.liveInfoValue}>{formatCurrency(race.purse)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Kỵ sĩ</Text>
              <Text style={styles.liveInfoValue}>{race.entries.length}</Text>
            </View>
            {leader && (
              <View style={[styles.infoItem, { flex: 2 }]}>
                <Text style={styles.infoLabel}>Dẫn đầu</Text>
                <View style={styles.leaderNameRow}>
                  <Zap size={13} color="#FFFFFF" />
                  <Text style={styles.liveInfoValue} numberOfLines={1}>{leader.horse.name}</Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (race.status === 'upcoming') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.upcomingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingBadgeText}>SẮP DIỄN RA</Text>
          </View>
          <Text style={styles.cardNumber}>#{race.number}</Text>
        </View>
        <Text style={styles.cardName}>{race.name}</Text>
        <View style={styles.metaRow}>
          <MetaChip Icon={Clock}   text={`${race.time} · ${formatDate(race.date)}`} />
          <MetaChip Icon={MapPin}  text={race.location} />
          <MetaChip Icon={Route}   text={`${race.distance}m`} />
          <MetaChip Icon={Trophy}  text={formatCurrency(race.purse)} />
          <MetaChip Icon={User}    text={`${race.entries.length} kỵ sĩ`} />
        </View>
      </TouchableOpacity>
    );
  }

  // completed
  const top3 = race.entries.filter(e => e.position && e.position <= 3).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.completedCard}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>KẾT THÚC</Text>
          </View>
          {race.resultPublished && (
            <View style={styles.publishedBadge}>
              <Text style={styles.publishedBadgeText}>ĐÃ CÔNG BỐ</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardNumber}>#{race.number}</Text>
      </View>
      <Text style={styles.cardName}>{race.name}</Text>
      <Text style={styles.completedMeta}>{race.location} · {formatDate(race.date)}</Text>
      {top3.map((entry, i) => (
        <View key={entry.horse.id} style={styles.resultRow}>
          <View style={styles.medalWrap}><Text style={[styles.rankLabel, { color: MEDAL_COLORS[i] }]}>#{i + 1}</Text></View>
          <View style={[styles.horseDot, { backgroundColor: entry.horse.color }]} />
          <Text style={styles.horseName}>{entry.horse.name}</Text>
          <Text style={styles.finishTime}>{entry.finishTime}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

function MetaChip({ Icon, text }: { Icon: React.ComponentType<{ size?: number; color?: string }>; text: string }) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaChip}>
      <Icon size={11} color={C.onSurfaceVariant} />
      <Text style={styles.metaChipText}>{text}</Text>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  // Live
  liveCard:      { borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  liveCardName:  { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 16 },
  liveCardMeta:  { color: 'rgba(255,255,255,0.6)', fontFamily: FontFamily.regular, fontSize: 12 },
  liveSeparator: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  liveInfoValue: { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 13 },
  liveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveBadge:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, backgroundColor: C.error, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  liveBadgeText: { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },

  // Upcoming
  upcomingCard:      { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  upcomingBadge:     { backgroundColor: `${C.secondary}30`, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  upcomingBadgeText: { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },

  // Completed
  completedCard:      { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  badgeRow:           { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  completedBadge:     { backgroundColor: `${C.onSurfaceVariant}25`, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  completedBadgeText: { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  publishedBadge:     { backgroundColor: `${C.tertiary}25`, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  publishedBadgeText: { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  completedMeta:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  resultRow:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  medalWrap:          { width: 22, alignItems: 'center' },
  rankLabel:          { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 12 },
  leaderNameRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  horseDot:           { width: 8, height: 8, borderRadius: 4 },
  horseName:          { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, flex: 1 },
  finishTime:         { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },

  // Shared
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 16 },
  cardNumber: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  infoRow:    { flexDirection: 'row', gap: Spacing.three },
  infoItem:   { flex: 1 },
  infoLabel:  { color: 'rgba(255,255,255,0.5)', fontFamily: FontFamily.regular, fontSize: 10, marginBottom: 2 },
  metaRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  metaChip:   { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${C.onSurfaceVariant}15`, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 3 },
  metaChipText:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  });
}
