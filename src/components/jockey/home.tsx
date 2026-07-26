import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView, BlurTargetView } from 'expo-blur';
import { Hand, Zap, Trophy, ChartBar, Mail, MapPin, Clock, ArrowLeftRight, Award } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyHeaderActions } from '@/components/jockey-header-actions';
import { JockeySuspensionBanner } from '@/components/jockey/jockey-suspension-banner';
import { useAuth } from '@/context/AuthContext';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useJockeyDashboard, useJockeyInvitations, useJockeyPoints, useJockeyRaces } from '@/hooks/useJockeyData';
import { formatCurrency, formatDate, formatNumber } from '@/mock-data';

const HERO_BG = require('@/assets/images/Meisho-Tabaru-Takarazuka-Kinen-scaled.png');

function RaceDayCountdown({ date, time }: { date: string; time: string }) {
  const styles = useThemedStyles(createStyles);
  const [label, setLabel] = useState(() => buildCountdownLabel(date, time));
  useEffect(() => {
    const id = setInterval(() => setLabel(buildCountdownLabel(date, time)), 1000);
    return () => clearInterval(id);
  }, [date, time]);
  return <Text style={styles.raceDayCountdown}>{label}</Text>;
}

function buildCountdownLabel(date: string, time: string): string {
  const diff = new Date(`${date}T${time}:00`).getTime() - Date.now();
  if (diff <= 0) return 'ĐÃ ĐẾN GIỜ';
  const totalSecs = Math.floor(diff / 1000);
  const hh = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSecs % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss} đến khi xuất phát`;
}

export function JockeyHome() {
  const heroBgRef = useRef<View>(null);
  const { user } = useAuth();
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const stats = useJockeyDashboard();
  const { invitations } = useJockeyInvitations();
  const { races: jockeyRaces } = useJockeyRaces();
  const { balance: pointsBalance } = useJockeyPoints();
  const pendingCount = stats.pendingInvitations || invitations.filter(i => i.status === 'pending').length;
  const today = new Date().toISOString().slice(0, 10);
  const todayRace = jockeyRaces.find(r => r.date === today && r.status !== 'completed');
  const upcomingRaces = jockeyRaces
    .filter(r => r.status === 'upcoming' && r.date !== today)
    .slice(0, 3);
  const displayName = user?.fullName ?? 'Kỵ sĩ';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();
  const completedRaces = jockeyRaces.filter(r => r.status === 'completed' && r.myEntry.position);
  const completedCount = completedRaces.length;
  const wins = completedRaces.filter(r => r.myEntry.position === 1).length;
  const podiums = completedRaces.filter(r => (r.myEntry.position ?? 0) <= 3).length;
  const winRate = completedCount > 0 ? Math.round((wins / completedCount) * 100) : 0;

  type HeroStat = { label: string; value: string | number; Icon: React.ComponentType<{ size?: number; color?: string }> };
  const heroStats: HeroStat[] = [
    { label: 'Trận đấu đã hoàn thành', value: completedCount, Icon: Zap      },
    { label: 'Chiến thắng',      value: wins,           Icon: Trophy   },
    { label: 'Vào top 3',        value: podiums,        Icon: Award    },
    { label: 'Tỷ lệ thắng',     value: `${winRate}%`,  Icon: ChartBar },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="RaceTrack VN" bangers contentContainerStyle={styles.scroll} rightAction={<JockeyHeaderActions />}>

          {/* Hero stats card */}
          <Animated.View entering={FadeIn.duration(380)}>
            <View style={styles.heroCard}>
              <BlurTargetView ref={heroBgRef} style={StyleSheet.absoluteFill}>
                <Image source={HERO_BG} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient
                  colors={['rgba(35,17,0,0.55)', 'rgba(15,7,0,0.85)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </BlurTargetView>

              <View style={styles.heroTop}>
                <View>
                  <View style={styles.heroGreetingRow}>
                    <Text style={styles.heroGreeting}>Xin chào</Text>
                    <Hand size={13} color="rgba(255,217,180,0.7)" />
                  </View>
                  <Text style={styles.heroName}>
                    {displayName.split(' ').slice(-2).join(' ')}
                  </Text>
                </View>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroInitials}>{initials}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {heroStats.map(s => (
                  <BlurView
                    key={s.label}
                    blurTarget={heroBgRef}
                    blurMethod="dimezisBlurView"
                    intensity={40}
                    tint="dark"
                    style={styles.statBox}>
                    <s.Icon size={18} color="rgba(255,217,180,0.8)" />
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </BlurView>
                ))}
              </View>
            </View>
          </Animated.View>

          <JockeySuspensionBanner />

          {/* Pending invitations alert */}
          {pendingCount > 0 && (
            <Animated.View entering={FadeInDown.delay(80).duration(320)}>
              <TouchableOpacity
                style={styles.inviteAlert}
                onPress={() => router.push('/jockey/invitations')}
                activeOpacity={0.85}>
                <View style={styles.inviteIconWrap}>
                  <Mail size={20} color={C.onSecondary} />
                </View>
                <View style={styles.inviteText}>
                  <Text style={styles.inviteTitle}>{pendingCount} lời mời chưa phản hồi</Text>
                  <Text style={styles.inviteSubtitle}>Nhấn để xem và phản hồi</Text>
                </View>
                <View style={styles.inviteBadge}>
                  <Text style={styles.inviteBadgeText}>{pendingCount}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Race Day Hero Card */}
          {todayRace && (
            <Animated.View entering={FadeInDown.delay(120).duration(320)}>
              <LinearGradient
                colors={todayRace.status === 'live'
                  ? ['#3B0000', '#7B1800', '#C04000']
                  : ['#1A2A3B', '#1E3A5F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.raceDayCard}>
                <View style={styles.raceDayBgCircle} />
                <View style={styles.raceDayTop}>
                  <View style={styles.raceDayPill}>
                    {todayRace.status === 'live' && <View style={styles.liveDot} />}
                    <Text style={styles.raceDayPillText}>
                      {todayRace.status === 'live' ? 'RACE DAY · LIVE' : 'RACE DAY'}
                    </Text>
                  </View>
                  <Text style={styles.raceDayName} numberOfLines={1}>{todayRace.name}</Text>
                </View>
                <View style={styles.raceDayHorseRow}>
                  <View style={[styles.raceDayHorseColor, { backgroundColor: todayRace.myEntry.horse.color }]} />
                  <Text style={styles.raceDayHorseName}>{todayRace.myEntry.horse.name}</Text>
                  <Text style={styles.raceDayLane}>Số #{todayRace.myEntry.horse.number}</Text>
                </View>
                {todayRace.status === 'live' ? (
                  <Text style={styles.raceDayLivePos}>
                    HẠNG {todayRace.myEntry.position ?? '–'}
                  </Text>
                ) : (
                  <RaceDayCountdown date={todayRace.date} time={todayRace.time} />
                )}
                <View style={styles.raceDayMeta}>
                  <Text style={styles.raceDayMetaText}>{todayRace.distance}m · {todayRace.surface}</Text>
                  <Text style={styles.raceDayMetaText}>{formatCurrency(todayRace.purse)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.raceDayBtn}
                  onPress={() => router.push(`/jockey/race/${todayRace.id}` as any)}
                  activeOpacity={0.85}>
                  <Text style={styles.raceDayBtnText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Upcoming races */}
          <Animated.View entering={FadeInDown.delay(160).duration(320)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trận đấu sắp tới</Text>
              <TouchableOpacity onPress={() => router.push('/jockey/assigned')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {upcomingRaces.map((race, i) => (
              <Animated.View key={race.id} entering={FadeInDown.delay(200 + i * 60).duration(280)}>
                <View style={styles.raceCard}>
                  <View style={styles.raceCardTop}>
                    <View style={styles.raceCardInfo}>
                      <Text style={styles.raceName}>{race.name}</Text>
                      <View style={styles.raceLocation}>
                        <MapPin size={12} color={C.onSurfaceVariant} />
                        <Text style={styles.raceLocationText}>{race.location}</Text>
                      </View>
                    </View>
                    <View style={styles.raceDateBadge}>
                      <Text style={styles.raceDateText}>{formatDate(race.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.raceCardMeta}>
                    <View style={styles.raceMeta}>
                      <Clock size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.raceMetaText}>{race.time}</Text>
                    </View>
                    <View style={styles.raceMeta}>
                      <ArrowLeftRight size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.raceMetaText}>{race.distance}m</Text>
                    </View>
                    <View style={styles.raceMeta}>
                      <Trophy size={12} color={C.secondary} />
                      <Text style={[styles.raceMetaText, { color: C.secondary }]}>{formatCurrency(race.purse)}</Text>
                    </View>
                    <View style={styles.confirmedBadge}>
                      <Text style={styles.confirmedText}>Đã xác nhận</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Points */}
          <Animated.View entering={FadeInDown.delay(360).duration(320)} style={styles.pointsCard}>
            <View style={styles.earningsHeader}>
              <Text style={styles.earningsLabel}>Số dư ví điểm</Text>
              <Award size={18} color={C.tertiary} />
            </View>
            <Text style={styles.pointsAmount}>{formatNumber(pointsBalance)}</Text>
          </Animated.View>

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

  // Hero
  heroCard:      { borderRadius: Shape.large, padding: Spacing.three, overflow: 'hidden' },
  heroTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.three },
  heroGreetingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroGreeting:  { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.medium, fontSize: 12 },
  heroName:      { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 22, letterSpacing: -0.3 },
  heroAvatar:    { width: 56, height: 56, borderRadius: Shape.medium, backgroundColor: 'rgba(255,217,180,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,217,180,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroInitials:  { color: '#FFD9B4', fontFamily: FontFamily.bold, fontSize: 22 },
  statsRow:      { flexDirection: 'row', gap: Spacing.two },
  statBox:       { flex: 1, backgroundColor: 'rgba(255,217,180,0.1)', borderRadius: Shape.large, padding: Spacing.two, alignItems: 'center', gap: 2, overflow: 'hidden' },
  statValue:     { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 18 },
  statLabel:     { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 10, textAlign: 'center' },

  // Invite alert
  inviteAlert:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.secondaryContainer, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, borderWidth: 1, borderColor: `${C.secondary}40` },
  inviteIconWrap:{ width: 40, height: 40, borderRadius: Shape.medium, backgroundColor: C.secondary, justifyContent: 'center', alignItems: 'center' },
  inviteText:    { flex: 1 },
  inviteTitle:   { color: C.onSecondaryContainer, fontFamily: FontFamily.bold, fontSize: 14 },
  inviteSubtitle:{ color: 'rgba(255,240,200,0.65)', fontFamily: FontFamily.regular, fontSize: 12 },
  inviteBadge:   { width: 28, height: 28, borderRadius: Shape.full, backgroundColor: C.secondary, justifyContent: 'center', alignItems: 'center' },
  inviteBadgeText:{ color: C.onSecondary, fontFamily: FontFamily.bold, fontSize: 14 },

  // Race Day card
  raceDayCard:       { borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two, overflow: 'hidden' },
  raceDayBgCircle:   { position: 'absolute', right: -24, top: -24, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)' },
  raceDayTop:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  raceDayPill:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,200,100,0.25)', borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4444' },
  raceDayPillText:   { color: '#FFD9B4', fontFamily: FontFamily.bold, fontSize: 9, letterSpacing: 0.8 },
  raceDayName:       { flex: 1, color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 14 },
  raceDayHorseRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  raceDayHorseColor: { width: 14, height: 14, borderRadius: 7 },
  raceDayHorseName:  { flex: 1, color: 'rgba(255,217,180,0.9)', fontFamily: FontFamily.bold, fontSize: 14 },
  raceDayLane:       { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 13 },
  raceDayCountdown:  { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 18, letterSpacing: -0.5 },
  raceDayLivePos:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 28, letterSpacing: -1 },
  raceDayMeta:       { flexDirection: 'row', justifyContent: 'space-between' },
  raceDayMetaText:   { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 12 },
  raceDayBtn:        { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Shape.full, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  raceDayBtnText:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 14 },

  // Upcoming races
  section:       { gap: Spacing.two },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:  { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  sectionLink:   { color: C.primary, fontFamily: FontFamily.medium, fontSize: 13 },
  raceCard:      { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two },
  raceCardTop:   { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  raceCardInfo:  { flex: 1, gap: 4 },
  raceName:      { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  raceLocation:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  raceLocationText:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  raceDateBadge: { backgroundColor: C.primaryContainer, borderRadius: Shape.medium, paddingHorizontal: 10, paddingVertical: 4 },
  raceDateText:  { color: C.primary, fontFamily: FontFamily.bold, fontSize: 11 },
  raceCardMeta:  { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two },
  raceMeta:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  raceMetaText:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  confirmedBadge:{ marginLeft: 'auto', backgroundColor: C.tertiaryContainer, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  confirmedText: { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 10 },

  // Points
  pointsCard:    { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.one },
  earningsHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  pointsAmount:  { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 28, letterSpacing: -0.5 },
  });
}
