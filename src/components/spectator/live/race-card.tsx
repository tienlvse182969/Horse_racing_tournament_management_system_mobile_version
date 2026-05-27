import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import type { Race } from '@/mock-data';
import { formatCurrency, formatDate } from '@/mock-data';

type Props = { race: Race; onPress: () => void };

export function RaceCard({ race, onPress }: Props) {
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
                <Text style={styles.liveInfoValue} numberOfLines={1}>
                  🏇 {leader.horse.name}
                </Text>
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
          <MetaChip icon="clock-outline" text={`${race.time} · ${formatDate(race.date)}`} />
          <MetaChip icon="map-marker-outline" text={race.location} />
          <MetaChip icon="road-variant" text={`${race.distance}m`} />
          <MetaChip icon="trophy-outline" text={formatCurrency(race.purse)} />
          <MetaChip icon="account-outline" text={`${race.entries.length} kỵ sĩ`} />
        </View>
      </TouchableOpacity>
    );
  }

  // completed
  const top3 = race.entries.filter(e => e.position && e.position <= 3).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const MEDAL = ['🥇', '🥈', '🥉'];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.completedCard}>
      <View style={styles.cardHeader}>
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>KẾT THÚC</Text>
        </View>
        <Text style={styles.cardNumber}>#{race.number}</Text>
      </View>
      <Text style={styles.cardName}>{race.name}</Text>
      <Text style={styles.completedMeta}>{race.location} · {formatDate(race.date)}</Text>
      {top3.map((entry, i) => (
        <View key={entry.horse.id} style={styles.resultRow}>
          <Text style={styles.medal}>{MEDAL[i]}</Text>
          <View style={[styles.horseDot, { backgroundColor: entry.horse.color }]} />
          <Text style={styles.horseName}>#{entry.horse.number} {entry.horse.name}</Text>
          <Text style={styles.finishTime}>{entry.finishTime}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

function MetaChip({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.metaChip}>
      <MaterialCommunityIcons name={icon as any} size={11} color={C.onSurfaceVariant} />
      <Text style={styles.metaChipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  completedBadge:     { backgroundColor: `${C.onSurfaceVariant}25`, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  completedBadgeText: { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  completedMeta:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  resultRow:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  medal:              { fontSize: 16, width: 22 },
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
