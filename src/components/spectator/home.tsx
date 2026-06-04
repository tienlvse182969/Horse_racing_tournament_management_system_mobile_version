import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Zap, Clock, MapPin, Route, ActivitySquare } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { AvatarTabButton } from '@/components/avatar-tab-button';
import { formatCurrency, formatDate } from '@/mock-data';
import { useSpectatorRaces } from '@/hooks/useSpectatorData';
import { ActivityIndicator } from 'react-native';
import { MedalIcon } from '@/components/ui/medal-icon';

export function SpectatorHome() {
  const { races, loading } = useSpectatorRaces();
  const liveRace = races.find(r => r.status === 'live');
  const upcomingRaces = races.filter(r => r.status === 'upcoming');
  const completedRace = races.find(r => r.status === 'completed');
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="RaceTrack VN" bangers contentContainerStyle={styles.scroll} rightAction={<AvatarTabButton />}>

          {loading && <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />}

          {/* Tournament Hero */}
          <Animated.View entering={FadeIn.duration(400)}>
            <LinearGradient
              colors={['#002112', '#2D6741']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}>
              <View style={styles.heroTagRow}>
                <Trophy size={11} color={C.tertiary} />
                <Text style={styles.heroTag}>GIẢI ĐUA 2026</Text>
              </View>
              <Text style={styles.heroTitle}>Cúp Vô Địch{'\n'}Quốc Gia 2026</Text>
              <Text style={styles.heroDate}>27/05 – 30/05/2026 · Phú Thọ</Text>
              <View style={styles.heroChips}>
                <View style={styles.chip}><Text style={styles.chipText}>5 cuộc đua</Text></View>
                <View style={styles.chip}><Text style={styles.chipText}>20 ngựa</Text></View>
                <View style={styles.chip}><Text style={styles.chipText}>8 kỵ sĩ</Text></View>
              </View>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => router.push('/predict' as never)}
                activeOpacity={0.8}>
                <Text style={styles.heroBtnText}>Dự đoán ngay ›</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Live Race */}
          {liveRace && (
            <Animated.View entering={FadeInDown.delay(80).duration(380)}>
              <Text style={styles.sectionTitle}>Đang diễn ra</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/live' as never)}>
                <LinearGradient
                  colors={['#003520', '#1A5C3A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.liveCard}>
                  <View style={styles.liveCardHeader}>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>TRỰC TIẾP</Text>
                    </View>
                    <Text style={styles.liveCardName}>{liveRace.name}</Text>
                  </View>
                  <Text style={styles.liveCardMeta}>
                    {liveRace.location} · {liveRace.distance}m · {formatCurrency(liveRace.purse)}
                  </Text>
                  {liveRace.entries.filter(e => e.position).length > 0 && (
                    <View style={styles.liveLeaderRow}>
                      <Text style={styles.liveLeaderLabel}>Đang dẫn đầu</Text>
                      <View style={styles.liveLeaderNameRow}>
                        <Zap size={14} color="#FFFFFF" />
                        <Text style={styles.liveLeaderName}>
                          #{liveRace.entries.find(e => e.position === 1)?.horse.number}{' '}
                          {liveRace.entries.find(e => e.position === 1)?.horse.name}
                        </Text>
                      </View>
                    </View>
                  )}
                  <Text style={styles.liveCardCta}>Xem trực tiếp →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Upcoming Races */}
          {upcomingRaces.length > 0 && (
            <Animated.View entering={FadeInDown.delay(160).duration(380)}>
              <Text style={styles.sectionTitle}>Sắp diễn ra</Text>
              {upcomingRaces.map(race => (
                <View key={race.id} style={styles.upcomingCard}>
                  <View style={styles.upcomingHeader}>
                    <View style={styles.upcomingBadge}>
                      <Text style={styles.upcomingBadgeText}>{formatDate(race.date)}</Text>
                    </View>
                    <Text style={styles.upcomingName} numberOfLines={1}>{race.name}</Text>
                  </View>
                  <View style={styles.upcomingMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.metaText}>{race.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MapPin size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.metaText} numberOfLines={1}>{race.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Route size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.metaText}>{race.distance}m</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Trophy size={12} color={C.onSurfaceVariant} />
                      <Text style={styles.metaText}>{formatCurrency(race.purse)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.predictBtn}
                    onPress={() => router.push('/predict' as never)}
                    activeOpacity={0.8}>
                    <Text style={styles.predictBtnText}>Dự đoán kết quả</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Latest Result */}
          {completedRace && (
            <Animated.View entering={FadeInDown.delay(240).duration(380)}>
              <Text style={styles.sectionTitle}>Kết quả mới nhất</Text>
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{completedRace.name}</Text>
                  <Text style={styles.resultDate}>{formatDate(completedRace.date)}</Text>
                </View>
                {completedRace.entries
                  .filter(e => e.position && e.position <= 3)
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((entry, i) => (
                    <View key={entry.horse.id} style={styles.resultRow}>
                      <View style={styles.resultMedalWrap}>
                        <MedalIcon position={i + 1} size={18} />
                      </View>
                      <View style={[styles.resultColorDot, { backgroundColor: entry.horse.color }]} />
                      <Text style={styles.resultHorseName}>
                        #{entry.horse.number} {entry.horse.name}
                      </Text>
                      <Text style={styles.resultTime}>{entry.finishTime}</Text>
                    </View>
                  ))}
              </View>
            </Animated.View>
          )}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  sectionTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 16, marginBottom: Spacing.two },

  // Hero
  heroCard:    { borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  heroTagRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroTag:     { color: C.tertiary, fontFamily: FontFamily.medium, fontSize: 11, letterSpacing: 1 },
  heroTitle:   { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 26, lineHeight: 34 },
  heroDate:    { color: 'rgba(255,255,255,0.65)', fontFamily: FontFamily.regular, fontSize: 12 },
  heroChips:   { flexDirection: 'row', gap: Spacing.one },
  chip:        { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  chipText:    { color: '#FFFFFF', fontFamily: FontFamily.medium, fontSize: 11 },
  heroBtn:     { alignSelf: 'flex-start', backgroundColor: C.tertiary, borderRadius: Shape.full, paddingHorizontal: Spacing.three, paddingVertical: 10, marginTop: Spacing.one },
  heroBtnText: { color: C.onTertiary, fontFamily: FontFamily.bold, fontSize: 13 },

  // Live card
  liveCard:       { borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  liveCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  liveBadge:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, backgroundColor: C.error, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  liveDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveBadgeText:  { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  liveCardName:   { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 15, flex: 1 },
  liveCardMeta:   { color: 'rgba(255,255,255,0.65)', fontFamily: FontFamily.regular, fontSize: 12 },
  liveLeaderRow:     { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: Shape.medium, padding: Spacing.two, gap: 2 },
  liveLeaderLabel:   { color: 'rgba(255,255,255,0.55)', fontFamily: FontFamily.regular, fontSize: 11 },
  liveLeaderNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveLeaderName:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 14 },
  liveCardCta:    { color: C.tertiary, fontFamily: FontFamily.medium, fontSize: 13, alignSelf: 'flex-end' },

  // Upcoming
  upcomingCard:   { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two, marginBottom: Spacing.two },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  upcomingBadge:  { backgroundColor: C.primaryContainer, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  upcomingBadgeText: { color: C.onPrimaryContainer, fontFamily: FontFamily.bold, fontSize: 11 },
  upcomingName:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, flex: 1 },
  upcomingMeta:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metaItem:       { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText:       { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  predictBtn:     { backgroundColor: C.primaryContainer, borderRadius: Shape.full, paddingVertical: 10, alignItems: 'center' },
  predictBtnText: { color: C.onPrimaryContainer, fontFamily: FontFamily.bold, fontSize: 13 },

  // Result
  resultCard:    { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  resultHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.one },
  resultName:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14, flex: 1 },
  resultDate:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  resultRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  resultMedalWrap: { width: 26, alignItems: 'center' },
  resultColorDot:{ width: 10, height: 10, borderRadius: 5 },
  resultHorseName:{ color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, flex: 1 },
  resultTime:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
});
