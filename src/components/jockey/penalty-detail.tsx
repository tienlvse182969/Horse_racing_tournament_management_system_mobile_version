import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShieldAlert, Gavel, Flag, Calendar } from 'lucide-react-native';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { BackButton } from '@/components/back-button';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { formatBanDate } from './horse-ban-badge';
import type { PenaltyDetailDto } from '@/api/jockey.api';
import { PENALTY_APPLIED_LABEL, VIOLATION_TARGET_LABEL as TARGET_LABEL } from '@/utils/penalty-labels';

const CATEGORY_LABEL: Record<string, string> = {
  race_conduct: 'Vi phạm luật đua',
  medical: 'Y tế / Doping',
  equipment: 'Trang thiết bị',
  administrative: 'Hành chính',
};

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Nghiêm trọng',
};

function severityColor(C: AppColors): Record<string, string> {
  return {
    low: C.tertiary,
    medium: C.secondary,
    high: C.error,
    critical: C.error,
  };
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function PenaltyDetail({ penalty, loading }: { penalty: PenaltyDetailDto | null; loading: boolean }) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const SEVERITY_COLOR = severityColor(C);
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Chi tiết án phạt</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={C.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : !penalty ? (
          <View style={styles.loading}>
            <ShieldAlert size={40} color={C.onSurfaceVariant} style={{ opacity: 0.4 }} />
            <Text style={styles.loadingText}>Không tìm thấy chi tiết án phạt</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.delay(0).duration(320)}>
              <View style={styles.summaryCard}>
                <ShieldAlert size={22} color={C.error} />
                <Text style={styles.summaryTitle}>
                  {penalty.bannedUntil
                    ? `Đình chỉ thi đấu đến ngày ${formatBanDate(penalty.bannedUntil)}`
                    : 'Đình chỉ thi đấu'}
                </Text>
                {penalty.rule && (
                  <Text style={styles.summarySubtitle}>{penalty.rule.name}</Text>
                )}
              </View>
            </Animated.View>

            {penalty.rule && (
              <Animated.View entering={FadeInDown.delay(80).duration(320)}>
                <View style={styles.card}>
                  <View style={styles.cardTitleRow}>
                    <Gavel size={16} color={C.primary} />
                    <Text style={styles.cardTitle}>Chi tiết vi phạm</Text>
                  </View>

                  <Text style={styles.ruleDescription}>{penalty.rule.description}</Text>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Mã lỗi</Text>
                      <Text style={styles.detailValue}>{penalty.rule.code}</Text>
                    </View>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Phân loại</Text>
                      <Text style={styles.detailValue}>{CATEGORY_LABEL[penalty.rule.category] ?? penalty.rule.category}</Text>
                    </View>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Mức độ</Text>
                      <Text style={[styles.detailValue, { color: SEVERITY_COLOR[penalty.rule.severity] ?? C.onSurface }]}>
                        {SEVERITY_LABEL[penalty.rule.severity] ?? penalty.rule.severity}
                      </Text>
                    </View>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Đối tượng</Text>
                      <Text style={styles.detailValue}>{TARGET_LABEL[penalty.target] ?? penalty.target}</Text>
                    </View>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Hình thức</Text>
                      <Text style={styles.detailValue}>
                        {penalty.penaltyApplied ? PENALTY_APPLIED_LABEL[penalty.penaltyApplied] ?? penalty.penaltyApplied : '—'}
                      </Text>
                    </View>
                    {penalty.rule.banDurationDays > 0 && (
                      <View style={styles.detailCell}>
                        <Text style={styles.detailLabel}>Số ngày cấm</Text>
                        <Text style={styles.detailValue}>{penalty.rule.banDurationDays} ngày thi đấu</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(160).duration(320)}>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Calendar size={16} color={C.secondary} />
                  <Text style={styles.cardTitle}>Ghi nhận vi phạm</Text>
                </View>
                <Text style={styles.noteText}>{penalty.description}</Text>
                <Text style={styles.recordedAt}>Ghi nhận lúc {formatFullDate(penalty.recordedAt)}</Text>
              </View>
            </Animated.View>

            {penalty.race && (
              <Animated.View entering={FadeInDown.delay(240).duration(320)}>
                <View style={styles.card}>
                  <View style={styles.cardTitleRow}>
                    <Flag size={16} color={C.tertiary} />
                    <Text style={styles.cardTitle}>Trận đấu liên quan</Text>
                  </View>
                  <Text style={styles.raceName}>{penalty.race.name}</Text>
                  <Text style={styles.raceDate}>{formatFullDate(penalty.race.scheduledAt)}</Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:     { flex: 1, backgroundColor: SC.lowest },
  safeArea: { flex: 1 },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, backgroundColor: SC.high, gap: Spacing.two },
  headerTitle: { flex: 1, color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },

  loading:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
  loadingText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14 },

  scrollContent: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  summaryCard:    { backgroundColor: C.errorContainer, borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: Spacing.one },
  summaryTitle:   { color: C.error, fontFamily: FontFamily.bold, fontSize: 16, textAlign: 'center' },
  summarySubtitle:{ color: C.error, fontFamily: FontFamily.medium, fontSize: 13, textAlign: 'center', opacity: 0.85 },

  card:         { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },

  ruleDescription: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19 },

  detailGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, rowGap: 10 },
  detailCell:  { width: '47%', gap: 2 },
  detailLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  detailValue: { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },

  noteText:    { color: C.onSurface, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  recordedAt:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },

  raceName: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  raceDate: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  });
}
