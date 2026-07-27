import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Trophy, Award } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyHeaderActions } from '@/components/jockey-header-actions';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useJockeyRaces } from '@/hooks/useJockeyData';
import { useHorseLeaderboard } from '@/hooks/useHorseLeaderboard';
import { useRaceLeaderboard } from '@/hooks/useRaceLeaderboard';
import { useAuth } from '@/context/AuthContext';
import { formatDateFull, formatNumber } from '@/mock-data';
import { MedalIcon } from '@/components/ui/medal-icon';

const HORSE_AVATAR = require('@/assets/images/a-horse-with-long-hair-and-a-white-mane-free-photo.jpeg');

type Tab = 'personal' | 'leaderboard';

const POS_LABEL: Record<number, string> = { 1: 'Giải Nhất', 2: 'Giải Nhì', 3: 'Giải Ba' };

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
        <LargeHeaderScrollView title="Kết quả & XH" contentContainerStyle={styles.scroll} rightAction={<JockeyHeaderActions />}>

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
  const { user } = useAuth();
  const { races, loading } = useJockeyRaces();
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
    { label: 'Trận đấu',    value: personalResults.length, Icon: Zap   },
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
      </LinearGradient>

      {loading && <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />}

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
                    {formatDateFull(r.date)}
                  </Text>
                  <Text style={styles.resultMetaDot}>·</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Zap size={10} color={C.onSurfaceVariant} />
                    <Text style={styles.resultMetaText}>{r.horse}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.resultRight}>
                <Text style={[styles.resultPos, { color: pc.color }]}>{posLabel}</Text>
                <Text style={styles.resultEarnings}>+{formatNumber(r.earnings)}</Text>
              </View>
            </View>
          </Animated.View>
        );
      })}

      {/* Full leaderboard per completed race — mirrors web's "Bảng xếp hạng đầy đủ" */}
      {personalResults.length > 0 && (
        <>
          <Text style={styles.historyTitle}>Bảng xếp hạng đầy đủ</Text>
          {personalResults.map((r, i) => (
            <Animated.View
              key={`lb-${r.raceId}`}
              entering={FadeInDown.delay((personalResults.length + i) * 60).duration(280)}>
              <RaceLeaderboardCard raceId={r.raceId} currentJockeyId={user?.id} />
            </Animated.View>
          ))}
        </>
      )}
    </>
  );
}

function fmtRaceTime(sec: number | null): string {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return m > 0 ? `${m}:${s.toFixed(2).padStart(5, '0')}` : `${s.toFixed(2)}s`;
}

function RaceLeaderboardCard({ raceId, currentJockeyId }: { raceId: string; currentJockeyId?: string }) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { leaderboard, loading } = useRaceLeaderboard(raceId);

  if (loading) {
    return (
      <View style={styles.lbRaceCard}>
        <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.two }} />
      </View>
    );
  }

  if (!leaderboard || leaderboard.stage === null || leaderboard.rankings.length === 0) {
    return (
      <View style={styles.lbRaceCard}>
        <Text style={styles.lbRaceTitle}>{leaderboard?.raceName ?? ''}</Text>
        <Text style={styles.emptyText}>Kết quả chưa được công bố cho trận đấu này.</Text>
      </View>
    );
  }

  const visibleRankings = leaderboard.rankings.filter(r => !r.isDisqualified);

  if (visibleRankings.length === 0) {
    return (
      <View style={styles.lbRaceCard}>
        <Text style={styles.lbRaceTitle}>{leaderboard.raceName}</Text>
        <Text style={styles.emptyText}>Không còn ngựa hợp lệ trong bảng xếp hạng sau khi xử phạt.</Text>
      </View>
    );
  }

  return (
    <View style={styles.lbRaceCard}>
      <Text style={styles.lbRaceTitle}>{leaderboard.raceName}</Text>
      <Text style={styles.lbRaceMeta}>
        vòng {leaderboard.round}
        {leaderboard.distance ? ` · ${leaderboard.distance}m` : ''}
        {leaderboard.tournamentName ? ` · ${leaderboard.tournamentName}` : ''}
      </Text>

      {visibleRankings.map((r, index) => {
        const displayRank = index + 1;
        const highlighted = r.jockey.id === currentJockeyId;
        return (
          <View key={`${r.horse.id}-${displayRank}`} style={[styles.lbRow, highlighted && styles.lbRowHighlight]}>
            <View style={styles.lbRankCol}>
              {displayRank <= 3 ? (
                <MedalIcon position={displayRank} size={20} />
              ) : (
                <Text style={styles.rankNum}>{displayRank}</Text>
              )}
              <Text style={styles.lbRankNum}>
                {displayRank}
                {r.isDeadHeat ? '=' : ''}
              </Text>
            </View>
            <View style={styles.lbMidCol}>
              <View style={styles.lbHorseRow}>
                <Text style={styles.lbHorseName} numberOfLines={1}>{r.horse.name}</Text>
                {highlighted && (
                  <View style={styles.lbBadge}>
                    <Text style={styles.lbBadgeText}>của bạn</Text>
                  </View>
                )}
              </View>
              <Text style={styles.lbJockeyName} numberOfLines={1}>{r.jockey.fullName}</Text>
            </View>
            <View style={styles.lbRightCol}>
              <Text style={styles.lbTime}>{fmtRaceTime(r.finishTime)}</Text>
              <Text style={styles.lbMargin}>
                {displayRank === 1 ? '—' : r.marginBehind != null ? `+${r.marginBehind.toFixed(2)}s` : '—'}
              </Text>
              <Text style={styles.lbPrize}>{r.prize > 0 ? formatNumber(r.prize) : '—'}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function LeaderboardContent() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { entries, loading } = useHorseLeaderboard(20);
  const PODIUM_COLORS = [C.secondary, C.onSurfaceVariant, C.primary];
  const PODIUM_BG     = [C.secondaryContainer, `${C.onSurfaceVariant}25`, C.primaryContainer];
  const top3 = entries.slice(0, 3);

  return (
    <>
      <Text style={styles.historyTitle}>Bảng xếp hạng ngựa</Text>

      {loading && <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />}

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
              <Image source={HORSE_AVATAR} style={styles.rankAvatar} contentFit="cover" />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{horse.horseName}</Text>
                <Text style={styles.rankStats}>
                  {horse.firstPlaceWins} bàn thắng / {horse.totalPublishedRaces} trận đấu
                </Text>
              </View>
              <View style={styles.rankRight}>
                <Text style={styles.rankWinRate}>Tỷ lệ thắng: {horse.winRate.toFixed(0)}%</Text>
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

  // Podium
  podiumRow:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: Spacing.two, marginBottom: Spacing.one },
  podiumItem:  { flex: 1, alignItems: 'center', gap: Spacing.one },
  podiumAvatar:{ width: 48, height: 48, borderRadius: Shape.full, justifyContent: 'center', alignItems: 'center' },
  podiumRank:  { fontFamily: FontFamily.bold, fontSize: 22 },
  podiumName:  { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 11, textAlign: 'center' },
  podiumWins:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  podiumBase:  { width: '100%', borderRadius: Shape.medium },

  // Leaderboard rows
  rankRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, marginBottom: Spacing.two },
  rankIcon:       { width: 36, height: 36, borderRadius: Shape.medium, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  rankAvatar:     { width: 36, height: 36, borderRadius: Shape.full, backgroundColor: SC.highest },
  rankNum:        { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 14 },
  rankInfo:       { flex: 1, gap: 3 },
  rankName:       { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 14 },
  rankStats:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  rankRight:      { alignItems: 'flex-end' },
  rankWinRate:    { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 13 },
  emptyText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, textAlign: 'center', paddingVertical: Spacing.four },

  // Full per-race leaderboard
  lbRaceCard:     { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, marginBottom: Spacing.two, gap: Spacing.one },
  lbRaceTitle:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },
  lbRaceMeta:     { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginBottom: 4 },
  lbRow:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderRadius: Shape.medium, paddingHorizontal: 6 },
  lbRowHighlight: { borderWidth: 1, borderColor: `${C.primary}40`, backgroundColor: `${C.primary}12` },
  lbRankCol:      { width: 32, alignItems: 'center', gap: 2 },
  lbRankNum:      { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 10 },
  lbMidCol:       { flex: 1, gap: 2 },
  lbHorseRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lbHorseName:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13, flexShrink: 1 },
  lbJockeyName:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  lbBadge:        { backgroundColor: C.primaryContainer, borderRadius: Shape.full, paddingHorizontal: 6, paddingVertical: 1 },
  lbBadgeText:    { color: C.primary, fontFamily: FontFamily.medium, fontSize: 9 },
  lbRightCol:     { alignItems: 'flex-end', gap: 1, minWidth: 70 },
  lbTime:         { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 12 },
  lbMargin:       { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  lbPrize:        { color: C.secondary, fontFamily: FontFamily.medium, fontSize: 11 },
  });
}
