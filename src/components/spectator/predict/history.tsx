import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { predictions, formatCurrency, formatDate } from '@/data/mock-data';

const won     = predictions.filter(p => p.status === 'won').length;
const lost    = predictions.filter(p => p.status === 'lost').length;
const pending = predictions.filter(p => p.status === 'pending').length;
const total   = predictions.length;
const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

const STATUS_CONFIG = {
  won:     { label: 'Đúng',    color: C.tertiary,        bg: C.tertiaryContainer,   icon: 'check-circle' },
  lost:    { label: 'Sai',     color: C.error,           bg: C.errorContainer,      icon: 'close-circle' },
  pending: { label: 'Đang chờ',color: C.secondary,       bg: C.secondaryContainer,  icon: 'clock-outline' },
};

export function PredictionHistory() {
  return (
    <View style={styles.root}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label="Đúng"     value={won}     color={C.tertiary}  />
        <StatCard label="Sai"      value={lost}    color={C.error}     />
        <StatCard label="Đang chờ" value={pending} color={C.secondary} />
        <StatCard label="Tỷ lệ"    value={`${winRate}%`} color={C.primary} />
      </View>

      {/* List */}
      {predictions.map((p, i) => {
        const cfg = STATUS_CONFIG[p.status];
        return (
          <Animated.View key={p.id} entering={FadeInDown.delay(i * 50).duration(280)}>
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <Text style={styles.raceName} numberOfLines={1}>{p.raceName}</Text>
                  <Text style={styles.raceDate}>{formatDate(p.raceDate)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <MaterialCommunityIcons name={cfg.icon as any} size={12} color={cfg.color} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={styles.horseRow}>
                <Text style={styles.horseLabel}>Dự đoán:</Text>
                <Text style={styles.horseName}>
                  #{p.predictedHorseNumber} {p.predictedHorseName}
                </Text>
              </View>

              {p.actualWinner && p.status !== 'won' && (
                <View style={styles.horseRow}>
                  <Text style={styles.horseLabel}>Thắng thực tế:</Text>
                  <Text style={[styles.horseName, { color: C.tertiary }]}>{p.actualWinner}</Text>
                </View>
              )}

              {p.reward && (
                <View style={styles.rewardRow}>
                  <MaterialCommunityIcons name="gift-outline" size={13} color={C.primary} />
                  <Text style={styles.rewardText}>+{formatCurrency(p.reward)}</Text>
                  {p.points && <Text style={styles.pointsText}>+{p.points.toLocaleString()} pts</Text>}
                </View>
              )}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.two },

  statsRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.one },
  statCard:  { flex: 1, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, alignItems: 'center', gap: 3 },
  statValue: { fontFamily: FontFamily.bold, fontSize: 18 },
  statLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10, textAlign: 'center' },

  card:       { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.one, marginBottom: Spacing.two },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  cardLeft:   { flex: 1 },
  raceName:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  raceDate:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  statusBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: FontFamily.bold, fontSize: 11 },

  horseRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginTop: 2 },
  horseLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  horseName:  { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },

  rewardRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginTop: Spacing.one },
  rewardText: { color: C.primary, fontFamily: FontFamily.bold, fontSize: 13 },
  pointsText: { color: C.secondary, fontFamily: FontFamily.medium, fontSize: 12 },
});
