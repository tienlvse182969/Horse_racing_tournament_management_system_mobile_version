import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Trophy, Award, Timer } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyAvatarButton } from '@/components/jockey-avatar-button';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useJockeyRaces } from '@/hooks/useJockeyData';
import { useHorseLeaderboard } from '@/hooks/useHorseLeaderboard';
import { formatCurrency } from '@/mock-data';
import { MedalIcon } from '@/components/ui/medal-icon';

type Tab = 'personal' | 'leaderboard';

const POS_LABEL: Record<number, string> = { 1: 'Vô địch', 2: 'Nhì', 3: 'Ba' };

type TabDef = { key: Tab; Icon: React.ComponentType<{ size?: number; color?: string }>; label: string };
const TABS: TabDef[] = [
  { key: 'personal',    Icon: Zap,    label: 'Cá nhân' },
  { key: 'leaderboard', Icon: Trophy, label: 'Bảng XH' },
];

export function JockeyResults() {
  const [tab, setTab] = useState<Tab>('personal');
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Kết quả & XH" contentContainerStyle={styles.scroll} rightAction={<JockeyAvatarButton />}>

          {/* Tab switcher */}
          <View style={styles.tabPill}>
            {TABS.map(({ key, Icon, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.tabBtn, tab === key && styles.tabBtnActive]}
                onPress={() => setTab(key)}
                activeOpacity={0.8}>
                <View style={styles.tabBtnInner}>
                  <Icon size={14} color={tab === key ? C.onPrimary : C.onSurfaceVariant} />
                  <Text style={[styles.tabBtnText, tab === key && styles.tabBtnTextActive]}>{label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'personal' ? <PersonalContent /> : <LeaderboardContent />}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

function PersonalContent() {
  const { C, SC } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const POS_CONFIG: Record<number, { iconColor: string; bg: string; color: string }> = {
    1: { iconColor: C.secondary, bg: C.secondaryContainer, color: C.secondary },
    2: { iconColor: '#9E9E9E', bg: `${C.onSurfaceVariant}25`, color: C.onSurfaceVariant },
    3: { iconColor: '#CD7F32', bg: '#3A2010', color: '#FFAB60' },
  };
  const { races } = useJockeyRaces();
  const personalResults = races
    .filter(r => r.status === 'completed' && r.myEntry.position)
    .map(r => ({
      raceId: r.id,
      raceName: r.name,
      date: r.date,
      horse: r.myEntry.horse.name,
      position: r.myEntry.position ?? 0,
      time: r.myEntry.finishTime ?? '-',
      earnings: r.purse,
    }));
  const totalEarnings = personalResults.reduce((s, r) => s + r.earnings, 0);
  const wins    = personalResults.filter(r => r.position === 1).length;
  const podiums = personalResults.filter(r => r.position <= 3).length;

  type StatBox = { label: string; value: string | number; Icon: React.ComponentType<{ size?: number; color?: string }> };
  const statBoxes: StatBox[] = [
    { label: 'Cuộc đua',    value: personalResults.length, Icon: Zap   },
    { label: 'Chiến thắng', value: wins,                   Icon: Trophy },
    { label: 'Podium',      value: podiums,                Icon: Award  },
  ];

  return (
    <>
      {/* Stats card */}
      <LinearGradient colors={['#3B1A00', '#7B3F00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statsCard}>
        <Text style={styles.statsCardLabel}>Thống kê gần đây</Text>
        <View style={styles.statsRow}>
          {statBoxes.map(s => (
            <View key={s.label} style={styles.statBox}>
              <s.Icon size={16} color="rgba(255,217,180,0.8)" />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Tổng thu nhập gần đây</Text>
          <Text style={styles.earningsValue}>{formatCurrency(totalEarnings)}</Text>
        </View>
      </LinearGradient>

      {/* History */}
      <Text style={styles.historyTitle}>Lịch sử thi đấu</Text>
      {personalResults.map((r, i) => {
        const pc = POS_CONFIG[r.position] ?? { iconColor: null as string | null, bg: SC.high, color: C.onSurfaceVariant };
        const posLabel = POS_LABEL[r.position] ?? `#${r.position}`;
        return (
          <Animated.View key={r.raceId} entering={FadeInDown.delay(i * 60).duration(280)}>
            <View style={styles.resultRow}>
              <View style={[styles.posBadge, { backgroundColor: pc.bg }]}>
                {pc.iconColor
                  ? <Trophy size={22} color={pc.iconColor} />
                  : <Text style={[styles.rankNum, { color: pc.color }]}>#{r.position}</Text>
                }
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultRace}>{r.raceName}</Text>
                <View style={styles.resultMeta}>
                  <Text style={styles.resultMetaText}>
                    {new Date(r.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                  <Text style={styles.resultMetaDot}>·</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Zap size={10} color={C.onSurfaceVariant} />
                    <Text style={styles.resultMetaText}>{r.horse}</Text>
                  </View>
                  <Text style={styles.resultMetaDot}>·</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Timer size={10} color={C.onSurfaceVariant} />
                    <Text style={styles.resultMetaText}>{r.time}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.resultRight}>
                <Text style={[styles.resultPos, { color: pc.color }]}>{posLabel}</Text>
                <Text style={styles.resultEarnings}>+{formatCurrency(r.earnings)}</Text>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </>
  );
}

function LeaderboardContent() {
  const styles = useThemedStyles(createStyles);
  const { entries, loading } = useHorseLeaderboard(20);

  return (
    <>
      <Text style={styles.historyTitle}>Bảng xếp hạng ngựa</Text>

      {!loading && entries.length === 0 && (
        <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
      )}

      {entries.map((horse, i) => {
        return (
          <Animated.View key={horse.horseId} entering={FadeInDown.delay(i * 50).duration(260)}>
            <View style={styles.rankRow}>
              <View style={styles.rankIcon}>
                {horse.rank <= 3 ? (
                  <MedalIcon position={horse.rank} size={22} />
                ) : (
                  <Text style={styles.rankNum}>{horse.rank}</Text>
                )}
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{horse.horseName}</Text>
                <Text style={styles.rankStats}>
                  {horse.firstPlaceWins} thắng / {horse.totalPublishedRaces} đua · {horse.winRate}%
                </Text>
              </View>
              <View style={styles.rankRight}>
                <Text style={styles.rankWinRate}>{horse.winRate.toFixed(0)}%</Text>
                {(horse.ownerName ?? horse.latestRaceName) && (
                  <Text style={styles.rankSubtitle} numberOfLines={1}>
                    {horse.ownerName ? `Chủ: ${horse.ownerName}` : horse.latestRaceName}
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>
        );
      })}
    </>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  tabPill:        { flexDirection: 'row', backgroundColor: SC.high, borderRadius: Shape.large, padding: 4 },
  tabBtn:         { flex: 1, paddingVertical: 10, borderRadius: Shape.medium, alignItems: 'center' },
  tabBtnActive:   { backgroundColor: C.primary },
  tabBtnInner:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabBtnText:     { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 14 },
  tabBtnTextActive:{ color: C.onPrimary },

  // Personal stats card
  statsCard:      { borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  statsCardLabel: { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.medium, fontSize: 12 },
  statsRow:       { flexDirection: 'row', gap: Spacing.two },
  statBox:        { flex: 1, backgroundColor: 'rgba(255,217,180,0.1)', borderRadius: Shape.large, padding: Spacing.two, alignItems: 'center', gap: 2 },
  statValue:      { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 18 },
  statLabel:      { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 10 },
  statsDivider:   { height: 1, backgroundColor: 'rgba(255,217,180,0.2)' },
  earningsRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel:  { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.regular, fontSize: 12 },
  earningsValue:  { color: '#FFD9B4', fontFamily: FontFamily.bold, fontSize: 16 },

  historyTitle:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, marginTop: 0 },

  resultRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, marginBottom: Spacing.two },
  posBadge:       { width: 44, height: 44, borderRadius: Shape.medium, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  resultInfo:     { flex: 1, gap: 3 },
  resultRace:     { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  resultMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  resultMetaText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  resultMetaDot:  { color: C.onSurfaceVariant, fontSize: 11 },
  resultRight:    { alignItems: 'flex-end', gap: 2 },
  resultPos:      { fontFamily: FontFamily.bold, fontSize: 14 },
  resultEarnings: { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 12 },

  // Leaderboard rows
  rankRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, marginBottom: Spacing.two },
  rankIcon:       { width: 36, height: 36, borderRadius: Shape.medium, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  rankNum:        { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 14 },
  rankInfo:       { flex: 1, gap: 3 },
  rankName:       { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 14 },
  rankStats:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  rankRight:      { alignItems: 'flex-end', gap: 2, maxWidth: 110 },
  rankWinRate:    { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 13 },
  rankSubtitle:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  emptyText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, textAlign: 'center', paddingVertical: Spacing.four },
  });
}
