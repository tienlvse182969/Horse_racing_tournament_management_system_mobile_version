import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Flag, Ruler } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyHeaderActions } from '@/components/jockey-header-actions';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useJockeyRaces } from '@/hooks/useJockeyData';
import { formatCurrency, isBeforeBanEnd } from '@/mock-data';
import type { JockeyRace } from '@/mock-data/jockey';
import { JockeySuspensionBanner } from '@/components/jockey/jockey-suspension-banner';
import { useAuth } from '@/context/AuthContext';

function statusConfig(C: AppColors) {
  return {
    live:      { label: 'Đang đua',    color: C.tertiary,        bg: C.tertiaryContainer },
    upcoming:  { label: 'Sắp diễn ra', color: C.secondary,       bg: C.secondaryContainer },
    completed: { label: 'Đã kết thúc', color: C.onSurfaceVariant, bg: `${C.onSurfaceVariant}22` },
  } as const;
}

function rankLabel(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `#${rank}`;
}

function rankColor(rank: number, C: AppColors): string {
  if (rank === 1) return C.tertiary;
  if (rank === 2) return C.secondary;
  if (rank === 3) return C.primary;
  return C.onSurfaceVariant;
}

function rankBg(rank: number, C: AppColors): string {
  if (rank === 1) return C.tertiaryContainer;
  if (rank === 2) return C.secondaryContainer;
  if (rank === 3) return C.primaryContainer;
  return `${C.onSurfaceVariant}22`;
}

function RaceCard({ race, index }: { race: JockeyRace; index: number }) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const STATUS_CONFIG = statusConfig(C);
  const cfg = STATUS_CONFIG[race.status] ?? STATUS_CONFIG.upcoming;
  const hasResult = race.status === 'completed' && race.myEntry.position !== undefined;
  const { user } = useAuth();
  const locked = isBeforeBanEnd(race.date, race.time, user?.penaltyStatus?.bannedUntil);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(280)}>
      <TouchableOpacity
        style={[styles.card, locked && styles.cardLocked]}
        onPress={() => router.push(`/jockey/race/${race.id}` as any)}
        disabled={locked}
        activeOpacity={0.85}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={2}>{race.name}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Detail grid — horse + distance only; tap for full details */}
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Flag size={12} color={C.onSurfaceVariant} />
            <Text style={styles.detailLabel}>Ngựa</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{race.myEntry.horse.name}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ruler size={12} color={C.onSurfaceVariant} />
            <Text style={styles.detailLabel}>Cự ly</Text>
            <Text style={styles.detailValue}>{race.distance}m</Text>
          </View>
        </View>

        {/* Result section */}
        {hasResult && race.myEntry.position !== undefined && (
          <View style={styles.resultRow}>
            <View style={[styles.rankBadge, { backgroundColor: rankBg(race.myEntry.position, C) }]}>
              <Text style={[styles.rankText, { color: rankColor(race.myEntry.position, C) }]}>
                {rankLabel(race.myEntry.position)}
              </Text>
            </View>
            {race.myEntry.finishTime && (
              <Text style={styles.resultMeta}>⏱ {race.myEntry.finishTime}</Text>
            )}
            {race.purse > 0 && (
              <Text style={styles.resultPrize}>🏆 {formatCurrency(race.purse)}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function RaceGroup({ title, races, offset }: { title: string; races: JockeyRace[]; offset: number }) {
  const styles = useThemedStyles(createStyles);
  if (races.length === 0) return null;
  return (
    <Animated.View entering={FadeIn.delay(offset * 80).duration(300)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{races.length}</Text>
      </View>
      {races.map((race, i) => (
        <RaceCard key={race.id} race={race} index={offset + i} />
      ))}
    </Animated.View>
  );
}

export function JockeyAssignedRaces() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { races, loading, reload } = useJockeyRaces();
  const [refreshing, setRefreshing] = useState(false);

  const live      = races.filter(r => r.status === 'live');
  const upcoming  = races.filter(r => r.status === 'upcoming');
  const completed = races.filter(r => r.status === 'completed');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload(false);
    setRefreshing(false);
  }, [reload]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Cuộc đua"
          contentContainerStyle={styles.scroll}
          rightAction={<JockeyHeaderActions />}
          refreshing={refreshing}
          onRefresh={handleRefresh}>

          <JockeySuspensionBanner />

          {loading && (
            <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />
          )}

          {!loading && races.length === 0 && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyWrap}>
              <Flag size={40} color={C.onSurfaceVariant} />
              <Text style={styles.emptyText}>Chưa có cuộc đua nào</Text>
              <Text style={styles.emptySubText}>Các cuộc đua được phân công sẽ hiện ở đây</Text>
            </Animated.View>
          )}

          {/* Summary banner */}
          {!loading && races.length > 0 && (
            <Animated.View entering={FadeIn.duration(350)}>
              <View style={styles.summaryBanner}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{races.length}</Text>
                  <Text style={styles.summaryLabel}>Tổng cộng</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: C.secondary }]}>{upcoming.length}</Text>
                  <Text style={styles.summaryLabel}>Sắp diễn ra</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: C.tertiary }]}>{completed.length}</Text>
                  <Text style={styles.summaryLabel}>Đã kết thúc</Text>
                </View>
              </View>
            </Animated.View>
          )}

          <RaceGroup title="Đang diễn ra" races={live}      offset={0} />
          <RaceGroup title="Sắp diễn ra"  races={upcoming}  offset={live.length} />
          <RaceGroup title="Đã kết thúc"  races={completed} offset={live.length + upcoming.length} />

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  // Summary banner
  summaryBanner:  { flexDirection: 'row', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center' },
  summaryItem:    { flex: 1, alignItems: 'center', gap: 3 },
  summaryValue:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 22 },
  summaryLabel:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  summaryDivider: { width: 1, height: 36, backgroundColor: `${C.onSurfaceVariant}30` },

  // Section
  section:       { gap: Spacing.two },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  sectionTitle:  { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, flex: 1 },
  sectionCount:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },

  // Race card
  card:       { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two, marginBottom: 2 },
  cardLocked: { opacity: 0.45 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  cardName:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, flex: 1, lineHeight: 22 },
  badge:      { borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3, flexShrink: 0 },
  badgeText:  { fontFamily: FontFamily.medium, fontSize: 11 },

  // Detail grid (2-column)
  detailGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, rowGap: 8 },
  detailItem:  { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, width: 44 },
  detailValue: { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 12, flex: 1 },

  // Result
  resultRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.one, borderTopWidth: 1, borderTopColor: `${C.onSurfaceVariant}20` },
  rankBadge:  { borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  rankText:   { fontFamily: FontFamily.bold, fontSize: 12 },
  resultMeta: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  resultPrize:{ color: C.primary, fontFamily: FontFamily.bold, fontSize: 12, marginLeft: 'auto' },

  // Empty state
  emptyWrap:    { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six },
  emptyText:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  emptySubText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, textAlign: 'center' },
  });
}
