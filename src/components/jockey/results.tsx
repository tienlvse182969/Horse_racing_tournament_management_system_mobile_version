import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyAvatarButton } from '@/components/jockey-avatar-button';
import { useJockeyRaces } from '@/hooks/useJockeyData';
import { jockeyRankings, formatCurrency } from '@/mock-data';

type Tab = 'personal' | 'leaderboard';

const POS_CONFIG: Record<number, { emoji: string; bg: string; color: string }> = {
  1: { emoji: '🥇', bg: C.secondaryContainer, color: C.secondary },
  2: { emoji: '🥈', bg: `${C.onSurfaceVariant}25`, color: C.onSurfaceVariant },
  3: { emoji: '🥉', bg: '#3A2010', color: '#FFAB60' },
};
const POS_LABEL: Record<number, string> = { 1: 'Vô địch', 2: 'Nhì', 3: 'Ba' };

export function JockeyResults() {
  const [tab, setTab] = useState<Tab>('personal');

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Kết quả & XH" contentContainerStyle={styles.scroll} rightAction={<JockeyAvatarButton />}>

          {/* Tab switcher */}
          <View style={styles.tabPill}>
            {([['personal', '🏇 Cá nhân'], ['leaderboard', '🏆 Bảng XH']] as [Tab, string][]).map(([t, label]) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.8}>
                <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{label}</Text>
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

  return (
    <>
      {/* Stats card */}
      <LinearGradient colors={['#3B1A00', '#7B3F00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statsCard}>
        <Text style={styles.statsCardLabel}>Thống kê gần đây</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'Cuộc đua',    value: personalResults.length, icon: '🏇' },
            { label: 'Chiến thắng', value: wins,                   icon: '🏆' },
            { label: 'Podium',      value: podiums,                 icon: '🥉' },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <Text style={{ fontSize: 16 }}>{s.icon}</Text>
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
        const pc = POS_CONFIG[r.position] ?? { emoji: `#${r.position}`, bg: SC.high, color: C.onSurfaceVariant };
        const posLabel = POS_LABEL[r.position] ?? `#${r.position}`;
        return (
          <Animated.View key={r.raceId} entering={FadeInDown.delay(i * 60).duration(280)}>
            <View style={styles.resultRow}>
              <View style={[styles.posBadge, { backgroundColor: pc.bg }]}>
                <Text style={{ fontSize: 22 }}>{pc.emoji}</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultRace}>{r.raceName}</Text>
                <View style={styles.resultMeta}>
                  <Text style={styles.resultMetaText}>
                    {new Date(r.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                  <Text style={styles.resultMetaDot}>·</Text>
                  <Text style={styles.resultMetaText}>🐎 {r.horse}</Text>
                  <Text style={styles.resultMetaDot}>·</Text>
                  <Text style={styles.resultMetaText}>⏱ {r.time}</Text>
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
  const me = jockeyRankings.find(j => j.isMe);

  return (
    <>
      {/* My rank highlight */}
      {me && (
        <LinearGradient colors={['#C07A00', '#3B1A00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.myRankCard}>
          <View style={styles.myRankLeft}>
            <View style={styles.myRankNumWrap}>
              <Text style={styles.myRankNum}>#{me.rank}</Text>
            </View>
            <View>
              <Text style={styles.myRankMeta}>Xếp hạng của bạn</Text>
              <Text style={styles.myRankName}>{me.name}</Text>
              <Text style={styles.myRankStats}>
                {me.wins} thắng · {me.winRate}% · {formatCurrency(me.earnings)}
              </Text>
            </View>
          </View>
          <View style={styles.myRankBadge}>
            <Text style={styles.myRankBadgeText}>🏆 Top 1</Text>
          </View>
        </LinearGradient>
      )}

      <Text style={styles.historyTitle}>Bảng xếp hạng Jockey</Text>

      {jockeyRankings.map((j, i) => {
        const RANK_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
        return (
          <Animated.View key={j.rank} entering={FadeInDown.delay(i * 50).duration(260)}>
            <View style={[styles.rankRow, j.isMe && styles.rankRowMe]}>
              <View style={styles.rankIcon}>
                {RANK_EMOJI[j.rank] ? (
                  <Text style={{ fontSize: 22 }}>{RANK_EMOJI[j.rank]}</Text>
                ) : (
                  <Text style={styles.rankNum}>{j.rank}</Text>
                )}
              </View>
              <View style={styles.rankInfo}>
                <View style={styles.rankNameRow}>
                  <Text style={[styles.rankName, j.isMe && { color: C.primary }]}>{j.name}</Text>
                  {j.isMe && (
                    <View style={styles.meBadge}>
                      <Text style={styles.meBadgeText}>BẠN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.rankStats}>
                  {j.wins} thắng / {j.races} đua · {j.winRate}%
                </Text>
              </View>
              <View style={styles.rankRight}>
                <Text style={styles.rankEarnings}>{formatCurrency(j.earnings)}</Text>
                <View style={styles.rankChange}>
                  {j.change > 0
                    ? <><MaterialCommunityIcons name="trending-up" size={10} color={C.tertiary} /><Text style={[styles.changeText, { color: C.tertiary }]}>+{j.change}</Text></>
                    : j.change < 0
                    ? <><MaterialCommunityIcons name="trending-down" size={10} color={C.error} /><Text style={[styles.changeText, { color: C.error }]}>{j.change}</Text></>
                    : <><MaterialCommunityIcons name="minus" size={10} color={C.onSurfaceVariant} /><Text style={[styles.changeText, { color: C.onSurfaceVariant }]}>0</Text></>
                  }
                </View>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  tabPill:        { flexDirection: 'row', backgroundColor: SC.high, borderRadius: Shape.large, padding: 4 },
  tabBtn:         { flex: 1, paddingVertical: 10, borderRadius: Shape.medium, alignItems: 'center' },
  tabBtnActive:   { backgroundColor: C.primary },
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

  // My rank card
  myRankCard:     { borderRadius: Shape.large, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  myRankLeft:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  myRankNumWrap:  { width: 48, height: 48, borderRadius: Shape.medium, backgroundColor: 'rgba(255,217,180,0.2)', justifyContent: 'center', alignItems: 'center' },
  myRankNum:      { color: '#FFD9B4', fontFamily: FontFamily.bold, fontSize: 20 },
  myRankMeta:     { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.regular, fontSize: 11 },
  myRankName:     { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 16 },
  myRankStats:    { color: 'rgba(255,217,180,0.65)', fontFamily: FontFamily.regular, fontSize: 11 },
  myRankBadge:    { backgroundColor: 'rgba(255,217,180,0.2)', borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 5 },
  myRankBadgeText:{ color: '#FFD9B4', fontFamily: FontFamily.bold, fontSize: 12 },

  // Leaderboard rows
  rankRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, marginBottom: Spacing.two },
  rankRowMe:      { backgroundColor: C.primaryContainer, borderWidth: 1.5, borderColor: `${C.primary}60` },
  rankIcon:       { width: 36, height: 36, borderRadius: Shape.medium, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  rankNum:        { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 14 },
  rankInfo:       { flex: 1, gap: 3 },
  rankNameRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankName:       { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 14 },
  meBadge:        { backgroundColor: C.primary, borderRadius: Shape.full, paddingHorizontal: 6, paddingVertical: 1 },
  meBadgeText:    { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 9 },
  rankStats:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  rankRight:      { alignItems: 'flex-end', gap: 2 },
  rankEarnings:   { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 13 },
  rankChange:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  changeText:     { fontFamily: FontFamily.medium, fontSize: 10 },
});
