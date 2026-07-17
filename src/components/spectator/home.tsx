import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Trophy, Zap, Clock, MapPin, Route, ActivitySquare, Target } from 'lucide-react-native';
import { router } from 'expo-router';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { HeaderActions } from '@/components/header-actions';
import { formatCurrency, formatDate } from '@/mock-data';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useSpectatorRaces, useSpectatorPredictions } from '@/hooks/useSpectatorData';
import { RaceDetail } from '@/components/spectator/live/race-detail';
import type { Race } from '@/types/race';

const MEDAL_COLORS = ['#C9971C', '#C0C0C0', '#CD7F32'];
const CAROUSEL_BG = require('@/assets/images/race-carousel-bg.jpg');

export function SpectatorHome() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { races, loading } = useSpectatorRaces();
  const { predictions } = useSpectatorPredictions();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  if (selectedRace) {
    return <RaceDetail race={selectedRace} onBack={() => setSelectedRace(null)} />;
  }

  const liveRace = races.find(r => r.status === 'live');
  const upcomingRaces = races.filter(r => r.status === 'upcoming');
  const completedRace = races.find(r => r.status === 'completed');
  const liveCount = races.filter(r => r.status === 'live').length;
  const wonPredictions = predictions.filter(p => p.status === 'won');

  // Highlight carousel: races currently live, plus all upcoming races
  const highlightRaces = [
    ...races.filter(r => r.status === 'live'),
    ...races.filter(r => r.status === 'upcoming'),
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="RaceTrack VN"
          bangers
          contentContainerStyle={styles.scroll}
          rightAction={<HeaderActions />}>

          {loading && <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />}

          {/* Highlight Carousel — live races & upcoming races open for prediction */}
          <HighlightCarousel races={highlightRaces} onSelectRace={setSelectedRace} />

          {/* Stats Row */}
          <Animated.View entering={FadeInDown.delay(40).duration(380)} style={styles.statsRow}>
            <View style={styles.statCard}>
              <ActivitySquare size={14} color={C.error} />
              <Text style={[styles.statValue, { color: C.error }]}>{liveCount}</Text>
              <Text style={styles.statLabel}>Đua hôm nay</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={14} color={C.primary} />
              <Text style={[styles.statValue, { color: C.primary }]}>{predictions.length}</Text>
              <Text style={styles.statLabel}>Vé dự đoán</Text>
            </View>
            <View style={styles.statCard}>
              <Trophy size={14} color={C.tertiary} />
              <Text style={[styles.statValue, { color: C.tertiary }]}>{wonPredictions.length}</Text>
              <Text style={styles.statLabel}>Thưởng sẵn</Text>
            </View>
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
                        <Text style={[styles.resultRankLabel, { color: MEDAL_COLORS[i] }]}>#{i + 1}</Text>
                      </View>
                      <View style={[styles.resultColorDot, { backgroundColor: entry.horse.color }]} />
                      <Text style={styles.resultHorseName}>
                        {entry.horse.name}
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

function HighlightCarousel({ races, onSelectRace }: { races: Race[]; onSelectRace: (race: Race) => void }) {
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const cardWidth = width - Spacing.three * 2;
  const cardGap = Spacing.two;
  const [activeIndex, setActiveIndex] = useState(0);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  useEffect(() => {
    if (races.length <= 1) return;
    const timer = setInterval(() => {
      const next = (activeIndexRef.current + 1) % races.length;
      scrollRef.current?.scrollTo({ x: next * (cardWidth + cardGap), animated: true });
      setActiveIndex(next);
    }, 10000);
    return () => clearInterval(timer);
  }, [races.length, cardWidth, cardGap, restartTrigger]);

  if (races.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + cardGap}
        snapToAlignment="start"
        onScrollBeginDrag={() => setRestartTrigger(t => t + 1)}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + cardGap));
          setActiveIndex(Math.max(0, Math.min(index, races.length - 1)));
        }}
        contentContainerStyle={{ gap: cardGap }}>
        {races.map(race => (
          <HighlightCard key={race.id} race={race} width={cardWidth} onSelect={onSelectRace} />
        ))}
      </ScrollView>
      {races.length > 1 && (
        <View style={styles.dotsRow}>
          {races.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

function HighlightCard({ race, width, onSelect }: { race: Race; width: number; onSelect: (race: Race) => void }) {
  const styles = useThemedStyles(createStyles);
  const isLive = race.status === 'live';
  const canAct = isLive || race.canPredict;
  const leader = race.entries.find(e => e.position === 1);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.highlightCard, { width }]}
      onPress={() => onSelect(race)}>
      <Image source={CAROUSEL_BG} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, styles.highlightOverlay]} />
      <View style={styles.highlightContent}>
        <View style={[styles.highlightBadge, isLive ? styles.highlightBadgeLive : styles.highlightBadgeUpcoming]}>
          {isLive && <View style={styles.liveDot} />}
          <Text style={styles.highlightBadgeText}>
            {isLive ? 'TRỰC TIẾP' : `SẮP DIỄN RA · ${formatDate(race.date)}`}
          </Text>
        </View>
        <Text style={styles.highlightName} numberOfLines={2}>{race.name}</Text>
        <Text style={styles.highlightMeta} numberOfLines={1}>
          {race.location} · Cự ly: {race.distance}m
        </Text>
        {isLive && leader && (
          <View style={styles.highlightLeaderRow}>
            <Zap size={13} color="#FFFFFF" />
            <Text style={styles.highlightLeaderText} numberOfLines={1}>
              Đang dẫn đầu: #{leader.horse.number} {leader.horse.name}
            </Text>
          </View>
        )}
        {canAct && (
          <TouchableOpacity
            style={styles.highlightBtn}
            onPress={e => {
              e.stopPropagation();
              router.push((isLive ? '/live' : '/predict') as never);
            }}
            activeOpacity={0.8}>
            <Text style={styles.highlightBtnText}>{isLive ? 'Xem trực tiếp' : 'Dự đoán ngay'} ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  sectionTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 16, marginBottom: Spacing.two },

  // Highlight carousel (live races + upcoming races open for prediction)
  highlightCard:      { height: 210, borderRadius: Shape.large, overflow: 'hidden' },
  highlightOverlay:   { backgroundColor: 'rgba(0,0,0,0.25)' },
  highlightContent:   { flex: 1, padding: Spacing.three, gap: Spacing.two },
  highlightBadge:        { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: Spacing.one, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  highlightBadgeLive:     { backgroundColor: C.error },
  highlightBadgeUpcoming: { backgroundColor: 'rgba(0,0,0,0.45)' },
  highlightBadgeText: { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  highlightName:      { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 22, lineHeight: 28, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  highlightMeta:      { color: 'rgba(255,255,255,0.85)', fontFamily: FontFamily.regular, fontSize: 12, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  highlightLeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: Shape.medium, paddingHorizontal: Spacing.two, paddingVertical: 6, alignSelf: 'flex-start' },
  highlightLeaderText:{ color: '#FFFFFF', fontFamily: FontFamily.medium, fontSize: 12 },
  highlightBtn:       { alignSelf: 'flex-start', backgroundColor: C.tertiary, borderRadius: Shape.full, paddingHorizontal: Spacing.three, paddingVertical: 10, marginTop: Spacing.one },
  highlightBtnText:   { color: C.onTertiary, fontFamily: FontFamily.bold, fontSize: 13 },
  dotsRow:  { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.two },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: C.outlineVariant },
  dotActive:{ width: 16, backgroundColor: C.primary },

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

  // Stats row
  statsRow:  { flexDirection: 'row', gap: Spacing.two },
  statCard:  { flex: 1, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: 3, alignItems: 'flex-start' },
  statValue: { fontFamily: FontFamily.bold, fontSize: 22, lineHeight: 26 },
  statLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, lineHeight: 14 },

  // Result
  resultCard:    { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  resultHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.one },
  resultName:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14, flex: 1 },
  resultDate:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  resultRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  resultMedalWrap: { width: 26, alignItems: 'center' },
  resultRankLabel: { fontFamily: FontFamily.bold, fontSize: 13 },
  resultColorDot:{ width: 10, height: 10, borderRadius: 5 },
  resultHorseName:{ color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, flex: 1 },
  resultTime:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  });
}
