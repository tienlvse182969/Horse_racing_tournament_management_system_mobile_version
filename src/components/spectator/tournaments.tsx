import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, Trophy } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { HeaderActions } from '@/components/header-actions';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useSpectatorTournaments } from '@/hooks/useSpectatorData';
import type { TournamentDto } from '@/api/spectator.api';
import { formatDateFull } from '@/mock-data';

function statusConfig(C: AppColors) {
  return {
    ongoing:   { label: 'Trực tiếp',    color: C.tertiary,        bg: C.tertiaryContainer },
    published: { label: 'Đang đăng ký', color: C.primary,         bg: C.primaryContainer },
    completed: { label: 'Kết thúc',     color: C.onSurfaceVariant, bg: `${C.onSurfaceVariant}22` },
    draft:     { label: 'Chuẩn bị',     color: C.onSurfaceVariant, bg: `${C.onSurfaceVariant}22` },
  } as const;
}

function TournamentCard({ t, index, onPress }: { t: TournamentDto; index: number; onPress: () => void }) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const STATUS_CONFIG = statusConfig(C);
  const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.draft;
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: `${C.onSurface}11` }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={2}>{t.name}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaRow}>
            <MapPin size={12} color={C.onSurfaceVariant} />
            <Text style={styles.metaText} numberOfLines={1}>{t.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Calendar size={12} color={C.onSurfaceVariant} />
            <Text style={styles.metaText}>
              {formatDateFull(t.startDate)} – {formatDateFull(t.endDate)}
            </Text>
          </View>
        </View>

        {t.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{t.description}</Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export function SpectatorTournaments() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { tournaments, loading, reload } = useSpectatorTournaments();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const live      = tournaments.filter(t => t.status === 'ongoing');
  const open      = tournaments.filter(t => t.status === 'published');

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Giải đấu"
          contentContainerStyle={styles.scroll}
          rightAction={<HeaderActions />}
          refreshing={refreshing}
          onRefresh={handleRefresh}>

          {loading && (
            <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />
          )}

          {!loading && tournaments.length === 0 && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyWrap}>
              <Trophy size={40} color={C.onSurfaceVariant} />
              <Text style={styles.emptyText}>Chưa có giải đấu nào</Text>
              <Text style={styles.emptySubText}>Các giải đấu sắp tới sẽ xuất hiện ở đây</Text>
            </Animated.View>
          )}

          {live.length > 0 && (
            <Animated.View entering={FadeIn.duration(350)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.liveDot} />
                <Text style={styles.sectionTitle}>Đang diễn ra</Text>
                <Text style={styles.sectionCount}>{live.length}</Text>
              </View>
              {live.map((t, i) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  index={i}
                  onPress={() => router.push(`/tournament/${t.id}` as any)}
                />
              ))}
            </Animated.View>
          )}

          {open.length > 0 && (
            <Animated.View entering={FadeIn.delay(live.length > 0 ? 120 : 0).duration(350)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Đang mở đăng ký</Text>
                <Text style={styles.sectionCount}>{open.length}</Text>
              </View>
              {open.map((t, i) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  index={live.length + i}
                  onPress={() => router.push(`/tournament/${t.id}` as any)}
                />
              ))}
            </Animated.View>
          )}

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

  section:       { gap: Spacing.two },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginBottom: 2 },
  sectionTitle:  { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, flex: 1 },
  sectionCount:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },
  liveDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.error },

  card:       { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  cardName:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, flex: 1, lineHeight: 22 },
  badge:      { borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3, flexShrink: 0 },
  badgeText:  { fontFamily: FontFamily.medium, fontSize: 11 },

  cardMeta:  { gap: 5 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, flex: 1 },

  cardDesc:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 18 },

  emptyWrap:    { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six },
  emptyText:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  emptySubText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },
  });
}
