import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyAvatarButton } from '@/components/jockey-avatar-button';
import { currentJockey, invitations, jockeyRaces, formatCurrency, formatDate } from '@/mock-data';

const pendingCount   = invitations.filter(i => i.status === 'pending').length;
const liveRace       = jockeyRaces.find(r => r.status === 'live');
const upcomingRaces  = jockeyRaces.filter(r => r.status === 'upcoming').slice(0, 3);

export function JockeyHome() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="RaceTrack VN" bangers contentContainerStyle={styles.scroll} rightAction={<JockeyAvatarButton />}>

          {/* Hero stats card */}
          <Animated.View entering={FadeIn.duration(380)}>
            <LinearGradient
              colors={['#3B1A00', '#7B3F00', '#C07A00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}>
              {/* BG decoration */}
              <View style={styles.heroBgCircle1} />
              <View style={styles.heroBgCircle2} />

              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroGreeting}>Xin chào 👋</Text>
                  <Text style={styles.heroName}>
                    {currentJockey.name.split(' ').slice(-2).join(' ')}
                  </Text>
                  <Text style={styles.heroLicense}>#{currentJockey.licenseNumber}</Text>
                </View>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroInitials}>{currentJockey.initials}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {[
                  { label: 'Tổng đua',     value: currentJockey.stats.totalRaces, icon: '🏇' },
                  { label: 'Chiến thắng',  value: currentJockey.stats.wins,       icon: '🏆' },
                  { label: 'Tỷ lệ thắng', value: `${currentJockey.stats.winRate}%`, icon: '📊' },
                ].map(s => (
                  <View key={s.label} style={styles.statBox}>
                    <Text style={styles.statIcon}>{s.icon}</Text>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Pending invitations alert */}
          {pendingCount > 0 && (
            <Animated.View entering={FadeInDown.delay(80).duration(320)}>
              <TouchableOpacity
                style={styles.inviteAlert}
                onPress={() => router.push('/jockey/invitations')}
                activeOpacity={0.85}>
                <View style={styles.inviteIconWrap}>
                  <Text style={{ fontSize: 20 }}>✉️</Text>
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

          {/* Live race banner */}
          {liveRace && (
            <Animated.View entering={FadeInDown.delay(120).duration(320)}>
              <LinearGradient
                colors={['#1A4D2E', '#2D6741']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.liveBanner}>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <View style={styles.liveInfo}>
                  <Text style={styles.liveName}>{liveRace.name}</Text>
                  <Text style={styles.livePos}>
                    Vị trí hiện tại của bạn: #{liveRace.myEntry.position ?? '–'}
                  </Text>
                </View>
                <MaterialCommunityIcons name="lightning-bolt" size={28} color="rgba(180,237,202,0.5)" />
              </LinearGradient>
            </Animated.View>
          )}

          {/* Upcoming races */}
          <Animated.View entering={FadeInDown.delay(160).duration(320)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cuộc đua sắp tới</Text>
              <TouchableOpacity onPress={() => router.push('/jockey/schedule')}>
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
                        <MaterialCommunityIcons name="map-marker-outline" size={12} color={C.onSurfaceVariant} />
                        <Text style={styles.raceLocationText}>{race.location}</Text>
                      </View>
                    </View>
                    <View style={styles.raceDateBadge}>
                      <Text style={styles.raceDateText}>{formatDate(race.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.raceCardMeta}>
                    <View style={styles.raceMeta}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.raceMetaText}>{race.time}</Text>
                    </View>
                    <View style={styles.raceMeta}>
                      <MaterialCommunityIcons name="arrow-expand-horizontal" size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.raceMetaText}>{race.distance}m</Text>
                    </View>
                    <View style={styles.raceMeta}>
                      <MaterialCommunityIcons name="trophy-outline" size={12} color={C.secondary} />
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

          {/* Monthly earnings */}
          <Animated.View entering={FadeInDown.delay(360).duration(320)} style={styles.earningsCard}>
            <View style={styles.earningsHeader}>
              <Text style={styles.earningsLabel}>Thu nhập tháng 5</Text>
              <Text style={{ fontSize: 18 }}>💰</Text>
            </View>
            <Text style={styles.earningsAmount}>{formatCurrency(405_000_000)}</Text>
            <View style={styles.earningsTrend}>
              <MaterialCommunityIcons name="trending-up" size={13} color={C.tertiary} />
              <Text style={styles.earningsTrendText}>+12.5%</Text>
              <Text style={styles.earningsTrendSub}>so với tháng trước</Text>
            </View>
            <View style={styles.barChart}>
              {[65, 80, 55, 90, 70, 100, 85].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height: `${h}%` as any,
                      backgroundColor: i === 6 ? C.primary : C.primaryContainer,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.barLabels}>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                <Text key={d} style={styles.barLabel}>{d}</Text>
              ))}
            </View>
          </Animated.View>

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  // Hero
  heroCard:      { borderRadius: Shape.large, padding: Spacing.three, overflow: 'hidden' },
  heroBgCircle1: { position: 'absolute', right: -24, top: -24, width: 96, height: 96, borderRadius: Shape.full, backgroundColor: 'rgba(255,217,180,0.1)' },
  heroBgCircle2: { position: 'absolute', right: -8, top: 32, width: 56, height: 56, borderRadius: Shape.full, backgroundColor: 'rgba(255,217,180,0.1)' },
  heroTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.three },
  heroGreeting:  { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.medium, fontSize: 12 },
  heroName:      { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 22, letterSpacing: -0.3 },
  heroLicense:   { color: 'rgba(255,217,180,0.55)', fontFamily: FontFamily.regular, fontSize: 12 },
  heroAvatar:    { width: 56, height: 56, borderRadius: Shape.medium, backgroundColor: 'rgba(255,217,180,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,217,180,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroInitials:  { color: '#FFD9B4', fontFamily: FontFamily.bold, fontSize: 22 },
  statsRow:      { flexDirection: 'row', gap: Spacing.two },
  statBox:       { flex: 1, backgroundColor: 'rgba(255,217,180,0.1)', borderRadius: Shape.large, padding: Spacing.two, alignItems: 'center', gap: 2 },
  statIcon:      { fontSize: 18 },
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

  // Live banner
  liveBanner:    { borderRadius: Shape.large, padding: Spacing.two, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  livePill:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FF4444', borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText:      { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 10 },
  liveInfo:      { flex: 1 },
  liveName:      { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 14 },
  livePos:       { color: 'rgba(180,237,202,0.8)', fontFamily: FontFamily.regular, fontSize: 12 },

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

  // Earnings
  earningsCard:  { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.one },
  earningsHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  earningsAmount:{ color: C.primary, fontFamily: FontFamily.bold, fontSize: 28, letterSpacing: -0.5 },
  earningsTrend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  earningsTrendText:{ color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 12 },
  earningsTrendSub: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  barChart:      { flexDirection: 'row', alignItems: 'flex-end', height: 48, gap: 5, marginTop: Spacing.two },
  bar:           { flex: 1, borderRadius: 4 },
  barLabels:     { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
});
