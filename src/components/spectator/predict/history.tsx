import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ban, CircleCheck, CircleX, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/mock-data';
import type { Prediction } from '@/mock-data/predictions';

type StatusIcon = React.ComponentType<{ size?: number; color?: string }>;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: StatusIcon }> = {
  won:     { label: 'Đúng',     color: C.tertiary,  bg: C.tertiaryContainer,  Icon: CircleCheck },
  lost:    { label: 'Sai',      color: C.error,     bg: C.errorContainer,     Icon: CircleX     },
  pending: { label: 'Đang chờ', color: C.secondary, bg: C.secondaryContainer, Icon: Clock       },
  cancelled: { label: 'Đã hủy', color: C.onSurfaceVariant, bg: SC.high, Icon: Ban },
};

type Props = { predictions: Prediction[]; onCancel?: (predictionId: string) => void };

export function PredictionHistory({ predictions, onCancel }: Props) {
  const won     = predictions.filter(p => p.status === 'won').length;
  const lost    = predictions.filter(p => p.status === 'lost').length;
  const pending = predictions.filter(p => p.status === 'pending').length;
  const total   = predictions.length;
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

  return (
    <View style={styles.root}>
      <View style={styles.statsRow}>
        <StatCard label="Đúng"     value={won}     color={C.tertiary}  />
        <StatCard label="Sai"      value={lost}    color={C.error}     />
        <StatCard label="Đang chờ" value={pending} color={C.secondary} />
        <StatCard label="Tỷ lệ"    value={`${winRate}%`} color={C.primary} />
      </View>

      {predictions.length === 0 ? (
        <Text style={styles.empty}>Chưa có dự đoán nào</Text>
      ) : (
        predictions.map((pred, i) => {
          const cfg = STATUS_CONFIG[pred.status];
          return (
            <Animated.View key={pred.id} entering={FadeInDown.delay(i * 40).duration(280)} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <cfg.Icon size={14} color={cfg.color} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                <Text style={styles.cardDate}>{formatDate(pred.raceDate)}</Text>
              </View>
              <Text style={styles.cardRace}>{pred.raceName}</Text>
              <Text style={styles.cardPick}>
                #{pred.predictedHorseNumber} {pred.predictedHorseName}
              </Text>
              {pred.reward ? (
                <Text style={styles.cardReward}>+{formatCurrency(pred.reward)}</Text>
              ) : null}
              {pred.status === 'pending' && onCancel ? (
                <Pressable style={styles.cancelBtn} onPress={() => onCancel(pred.id)}>
                  <Text style={styles.cancelText}>Hủy dự đoán</Text>
                </Pressable>
              ) : null}
            </Animated.View>
          );
        })
      )}
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}40` }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { gap: Spacing.two },
  statsRow:    { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.two },
  statCard:    { flex: 1, alignItems: 'center', padding: Spacing.two, borderRadius: Shape.medium, borderWidth: 1, backgroundColor: SC.low },
  statValue:   { fontFamily: FontFamily.bold, fontSize: 16 },
  statLabel:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  empty:       { color: C.onSurfaceVariant, textAlign: 'center', padding: Spacing.four },
  card:        { backgroundColor: SC.low, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.one, marginBottom: Spacing.two },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Shape.full },
  statusText:  { fontFamily: FontFamily.medium, fontSize: 11 },
  cardDate:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  cardRace:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  cardPick:    { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 13 },
  cardReward:  { color: C.primary, fontFamily: FontFamily.bold, fontSize: 14 },
  cancelBtn:   { alignSelf: 'flex-start', borderRadius: Shape.full, borderWidth: 1, borderColor: C.error, paddingHorizontal: 12, paddingVertical: 6, marginTop: 2 },
  cancelText:  { color: C.error, fontFamily: FontFamily.medium, fontSize: 12 },
});
