import { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue, useFrameCallback, runOnJS } from 'react-native-reanimated';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ChevronLeft, Ruler, Trophy, Leaf, RotateCcw, MapPin, CalendarDays } from 'lucide-react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { formatCurrency } from '@/mock-data';
import { MedalIcon } from '@/components/ui/medal-icon';
import { RaceLaneTrack } from '@/components/spectator/live/race-lane-track';
import { Commentary } from '@/components/spectator/live/commentary';
import { LiveStandings } from '@/components/spectator/live/live-standings';
import type { StandingEntry, RaceState } from '@/components/spectator/live/live-viewer';
import type { JockeyRace } from '@/mock-data/jockey';
import type { Race, RaceEntry } from '@/mock-data/races';
import { HorseBanBadge } from '@/components/jockey/horse-ban-badge';

// ─── Animation constants (same as LiveViewer) ─────────────────────────────────
const SPEED_CONSTANT = 0.0000333;
const MAX_HORSES = 10;

function formatFinishTime(ms: number): string {
  const totalSecs = ms / 1000;
  const mins = Math.floor(totalSecs / 60);
  const secs = (totalSecs % 60).toFixed(1).padStart(4, '0');
  return `${mins}:${secs}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  jockeyRace: JockeyRace;
  fullRace: Race | null;
  jockeyName: string;
};

// ─── Root component — delegates to phase view ────────────────────────────────
export function RaceDay({ jockeyRace, fullRace, jockeyName }: Props) {
  const statusLabel =
    jockeyRace.status === 'live'      ? 'ĐANG ĐUA'     :
    jockeyRace.status === 'upcoming'  ? 'SẮP DIỄN RA'  :
                                        'KẾT THÚC';

  const badgeColors: [string, string] =
    jockeyRace.status === 'live'     ? [C.error, `${C.error}30`] :
    jockeyRace.status === 'upcoming' ? [C.primary, `${C.primary}30`] :
                                       [C.onSurfaceVariant, `${C.onSurfaceVariant}25`];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={24} color={C.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{jockeyRace.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeColors[1] }]}>
            {jockeyRace.status === 'live' && <View style={styles.liveDot} />}
            <Text style={[styles.statusBadgeText, { color: badgeColors[0] }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Phase content */}
        {jockeyRace.status === 'upcoming' && (
          <PreRaceView jockeyRace={jockeyRace} fullRace={fullRace} />
        )}
        {jockeyRace.status === 'live' && (
          <LiveRaceView jockeyRace={jockeyRace} fullRace={fullRace} jockeyName={jockeyName} />
        )}
        {jockeyRace.status === 'completed' && (
          <PostRaceView jockeyRace={jockeyRace} fullRace={fullRace} />
        )}
      </SafeAreaView>
    </View>
  );
}

// ─── Phase 1: Pre-race ────────────────────────────────────────────────────────
function PreRaceView({ jockeyRace, fullRace }: { jockeyRace: JockeyRace; fullRace: Race | null }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(jockeyRace.date, jockeyRace.time));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(jockeyRace.date, jockeyRace.time)), 1000);
    return () => clearInterval(id);
  }, [jockeyRace.date, jockeyRace.time]);

  const { hh, mm, ss, started } = timeLeft;
  const { horse, odds } = jockeyRace.myEntry;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Countdown */}
      <Animated.View entering={FadeIn.duration(400)}>
        <LinearGradient colors={['#1A2A3B', '#1E3A5F']} style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>{started ? 'ĐÃ ĐẾN GIỜ' : 'Xuất phát sau'}</Text>
          {!started && (
            <View style={styles.countdownRow}>
              <CountdownUnit value={hh} unit="GIỜ" />
              <Text style={styles.countdownColon}>:</Text>
              <CountdownUnit value={mm} unit="PHÚT" />
              <Text style={styles.countdownColon}>:</Text>
              <CountdownUnit value={ss} unit="GIÂY" />
            </View>
          )}
          {started && <Text style={styles.countdownStarted}>Cuộc đua đang bắt đầu!</Text>}
        </LinearGradient>
      </Animated.View>

      {/* Venue & meeting */}
      <Animated.View entering={FadeInDown.delay(80).duration(360)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Địa điểm & Lịch thi đấu</Text>
          <View style={styles.venueRow}>
            <MapPin size={14} color={C.primary} />
            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{jockeyRace.trackName ?? jockeyRace.location}</Text>
              {jockeyRace.trackLocation && (
                <Text style={styles.venueAddress}>{jockeyRace.trackLocation}</Text>
              )}
            </View>
          </View>
          <View style={styles.venueRow}>
            <CalendarDays size={14} color={C.secondary} />
            <View style={styles.venueInfo}>
              {jockeyRace.meetingName && (
                <Text style={styles.venueName}>{jockeyRace.meetingName}</Text>
              )}
              <Text style={styles.venueAddress}>
                {new Date(`${jockeyRace.date}T${jockeyRace.time}:00`).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' — '}{jockeyRace.time}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* My horse */}
      <Animated.View entering={FadeInDown.delay(160).duration(360)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Con ngựa của bạn</Text>
          <View style={styles.horseRow}>
            <View style={[styles.horseSwatch, { backgroundColor: horse.color }]} />
            <View style={styles.horseInfo}>
              <Text style={styles.horseName}>{horse.name}</Text>
              <Text style={styles.horseMeta}>Số #{horse.number}  ·  Odds {odds}x</Text>
            </View>
          </View>
          <HorseBanBadge penaltyStatus={horse.penaltyStatus} style={{ marginTop: Spacing.one }} />
          {/* Extra horse details from backend */}
          <View style={styles.horseDetailsGrid}>
            {horse.breed ? (
              <View style={styles.horseDetailCell}>
                <Text style={styles.horseDetailLabel}>Giống</Text>
                <Text style={styles.horseDetailValue}>{horse.breed}</Text>
              </View>
            ) : null}
            {horse.age ? (
              <View style={styles.horseDetailCell}>
                <Text style={styles.horseDetailLabel}>Tuổi</Text>
                <Text style={styles.horseDetailValue}>{horse.age} năm</Text>
              </View>
            ) : null}
            {horse.healthStatus ? (
              <View style={[styles.horseDetailCell, styles.horseDetailHealth]}>
                <Text style={styles.horseDetailLabel}>Sức khỏe</Text>
                <Text style={[
                  styles.horseDetailValue,
                  { color: horse.healthStatus === 'fit' ? C.tertiary : C.error },
                ]}>
                  {horse.healthStatus === 'fit' ? 'Tốt' :
                   horse.healthStatus === 'injured' ? 'Chấn thương' :
                   horse.healthStatus === 'recovering' ? 'Hồi phục' :
                   horse.healthStatus}
                </Text>
              </View>
            ) : null}
            {horse.registrationId ? (
              <View style={styles.horseDetailCell}>
                <Text style={styles.horseDetailLabel}>Mã số</Text>
                <Text style={styles.horseDetailValue}>{horse.registrationId}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>

      {/* Race conditions */}
      <Animated.View entering={FadeInDown.delay(240).duration(360)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Điều kiện đua</Text>
          <View style={styles.conditionsGrid}>
            <ConditionCell icon={<Leaf size={14} color={C.tertiary} />} label="Mặt đường" value={jockeyRace.surface} />
            <ConditionCell icon={<Ruler size={14} color={C.primary} />} label="Cự ly" value={`${jockeyRace.distance}m`} />
            <ConditionCell icon={<RotateCcw size={14} color={C.secondary} />} label="Số vòng" value={fullRace ? `${fullRace.laps} vòng` : '–'} />
            <ConditionCell icon={<Trophy size={14} color={C.secondary} />} label="Giải thưởng" value={formatCurrency(jockeyRace.purse)} />
          </View>
        </View>
      </Animated.View>

      {/* Competitors */}
      {fullRace && (
        <Animated.View entering={FadeInDown.delay(320).duration(360)}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đối thủ ({fullRace.entries.length} ngựa)</Text>
            {fullRace.entries.map((entry, i) => {
              const isMe = entry.horse.number === jockeyRace.myEntry.horse.number;
              return (
                <View key={entry.horse.id} style={[styles.entryRow, isMe && styles.entryRowMe]}>
                  <View style={[styles.entryColorBar, { backgroundColor: entry.horse.color }]} />
                  <Text style={styles.entryNumber}>#{entry.horse.number}</Text>
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryName, isMe && styles.entryNameMe]}>{entry.horse.name}</Text>
                    <Text style={styles.entryJockey}>{isMe ? '← Bạn' : entry.jockeyName}</Text>
                  </View>
                  <Text style={styles.entryOdds}>{entry.odds}x</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

// ─── Phase 2: Live race ───────────────────────────────────────────────────────
function LiveRaceView({
  jockeyRace,
  fullRace,
  jockeyName,
}: {
  jockeyRace: JockeyRace;
  fullRace: Race | null;
  jockeyName: string;
}) {
  const [raceState, setRaceState] = useState<RaceState>('idle');
  const [standings, setStandings] = useState<StandingEntry[]>(() =>
    (fullRace?.entries ?? []).map((e, i) => ({
      entry: e, progress: 0, rank: i + 1, previousRank: i + 1, finished: false,
    })),
  );
  const [commentary, setCommentary] = useState<string[]>([]);
  const [lapProgress, setLapProgress] = useState(0);
  const [myRank, setMyRank] = useState(jockeyRace.myEntry.position ?? 1);
  const [gapToLeader, setGapToLeader] = useState(0);

  const finishTimesRef = useRef<Record<string, string>>({});
  const finishOrderRef = useRef<string[]>([]);
  const prevRanksRef = useRef<Record<string, number>>({});
  const commentaryTriggersRef = useRef<Set<string>>(new Set());
  const raceFinishedRef = useRef(false);
  const entriesRef = useRef<RaceEntry[]>((fullRace?.entries ?? []).slice(0, MAX_HORSES));

  const highlightIndex = fullRace
    ? fullRace.entries.findIndex(e => e.horse.number === jockeyRace.myEntry.horse.number)
    : -1;

  // ── Shared values (10 slots, unconditional) ────────────────────────────────
  const sv0 = useSharedValue(0); const sv1 = useSharedValue(0);
  const sv2 = useSharedValue(0); const sv3 = useSharedValue(0);
  const sv4 = useSharedValue(0); const sv5 = useSharedValue(0);
  const sv6 = useSharedValue(0); const sv7 = useSharedValue(0);
  const sv8 = useSharedValue(0); const sv9 = useSharedValue(0);
  const progressSvs = [sv0, sv1, sv2, sv3, sv4, sv5, sv6, sv7, sv8, sv9];

  const sp0 = useSharedValue(0); const sp1 = useSharedValue(0);
  const sp2 = useSharedValue(0); const sp3 = useSharedValue(0);
  const sp4 = useSharedValue(0); const sp5 = useSharedValue(0);
  const sp6 = useSharedValue(0); const sp7 = useSharedValue(0);
  const sp8 = useSharedValue(0); const sp9 = useSharedValue(0);
  const speedSvs = [sp0, sp1, sp2, sp3, sp4, sp5, sp6, sp7, sp8, sp9];

  const jt0 = useSharedValue(0); const jt1 = useSharedValue(0);
  const jt2 = useSharedValue(0); const jt3 = useSharedValue(0);
  const jt4 = useSharedValue(0); const jt5 = useSharedValue(0);
  const jt6 = useSharedValue(0); const jt7 = useSharedValue(0);
  const jt8 = useSharedValue(0); const jt9 = useSharedValue(0);
  const jitterSvs = [jt0, jt1, jt2, jt3, jt4, jt5, jt6, jt7, jt8, jt9];

  const isRacingSv      = useSharedValue(false);
  const horseCountSv    = useSharedValue(entriesRef.current.length);
  const raceLapsSv      = useSharedValue(fullRace?.laps ?? 1);
  const finishedCountSv = useSharedValue(0);
  const horseIdsSv      = useSharedValue<string[]>(entriesRef.current.map(e => e.horse.id));

  const addCommentary = useCallback((line: string) => {
    setCommentary(prev => [...prev, line]);
  }, []);

  const onHorseFinished = useCallback((horseId: string, timeMs: number) => {
    finishTimesRef.current[horseId] = formatFinishTime(timeMs);
    finishOrderRef.current.push(horseId);
    const name = entriesRef.current.find(e => e.horse.id === horseId)?.horse.name ?? '';
    const pos = finishOrderRef.current.length;
    if (pos === 1) addCommentary(`🏆 ${name} về nhất! Thời gian ${finishTimesRef.current[horseId]}.`);
    else if (pos === 2) addCommentary(`🥈 ${name} về nhì!`);
    else if (pos === 3) addCommentary(`🥉 ${name} về ba!`);
  }, [addCommentary]);

  const onRaceComplete = useCallback(() => {
    if (raceFinishedRef.current) return;
    raceFinishedRef.current = true;
    isRacingSv.value = false;
    setRaceState('finished');
  }, [isRacingSv]);

  const frameCallback = useFrameCallback((fi) => {
    if (!isRacingSv.value) return;
    const dt = Math.min(fi.timeSincePreviousFrame ?? 16, 50);
    const t = fi.timeSinceFirstFrame;
    const n = horseCountSv.value;
    const laps = raceLapsSv.value;
    const ids = horseIdsSv.value;

    for (let i = 0; i < n; i++) {
      if (progressSvs[i].value >= laps) continue;
      const speedVar = Math.sin(t * 0.004 + i * 2.3) * 0.00004;
      const inc = Math.max(0, (speedSvs[i].value + jitterSvs[i].value + speedVar) * dt);
      const next = progressSvs[i].value + inc;
      if (next >= laps) {
        progressSvs[i].value = laps;
        finishedCountSv.value += 1;
        runOnJS(onHorseFinished)(ids[i], t);
        if (finishedCountSv.value === 1) runOnJS(onRaceComplete)();
      } else {
        progressSvs[i].value = next;
      }
    }
  }, false);

  useEffect(() => {
    if (!fullRace) return;
    const entries = fullRace.entries.slice(0, MAX_HORSES);
    entriesRef.current = entries;
    const minOdds = Math.min(...entries.map(e => e.odds));
    const maxOdds = Math.max(...entries.map(e => e.odds));
    const oddsRange = maxOdds - minOdds || 1;
    entries.forEach((e, i) => {
      const normalized = 1 - 0.20 * (e.odds - minOdds) / oddsRange;
      speedSvs[i].value  = SPEED_CONSTANT * normalized;
      jitterSvs[i].value = (((i * 7 + 3) % 10) - 5) * 0.000004;
    });
    horseCountSv.value = entries.length;
    raceLapsSv.value   = fullRace.laps;
    horseIdsSv.value   = entries.map(e => e.horse.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullRace?.id]);

  useEffect(() => {
    if (raceState !== 'racing' || !fullRace) return;
    const laps = fullRace.laps;
    const interval = setInterval(() => {
      const entries = entriesRef.current;
      const snapshots = entries.map((e, i) => ({
        entry: e,
        progress: progressSvs[i].value,
        finished: progressSvs[i].value >= laps,
        finishTime: finishTimesRef.current[e.horse.id],
      }));
      snapshots.sort((a, b) => b.progress - a.progress);
      const newStandings = snapshots.map((s, idx) => ({
        ...s,
        rank: idx + 1,
        previousRank: prevRanksRef.current[s.entry.horse.id] ?? idx + 1,
      }));
      newStandings.forEach(s => { prevRanksRef.current[s.entry.horse.id] = s.rank; });
      setStandings(newStandings);

      const leaderProgress = snapshots[0]?.progress ?? 0;
      setLapProgress(Math.min(leaderProgress / laps, 1));

      // Update my rank + gap
      const myIdx = newStandings.findIndex(
        s => s.entry.horse.number === jockeyRace.myEntry.horse.number,
      );
      if (myIdx >= 0) {
        setMyRank(newStandings[myIdx].rank);
        const leaderProg = snapshots[0]?.progress ?? 0;
        const myProg = progressSvs[highlightIndex >= 0 ? highlightIndex : 0].value;
        setGapToLeader(Math.max(0, leaderProg - myProg));
      }

      const leader = snapshots[0]?.entry.horse.name ?? '';
      const chaser = snapshots[1]?.entry.horse.name ?? '';
      const checkpoints: [number, string][] = [
        [0.15, `${leader} tăng tốc ra khỏi vạch xuất phát!`],
        [0.5,  `${leader} đang dẫn đầu, ${chaser} bám sát phía sau.`],
        [1.0,  `Hoàn thành vòng 1! ${leader} tiếp tục giữ vị trí dẫn đầu.`],
        [1.5,  `Đoạn nước rút! ${leader} toàn lực về đích!`],
        [1.8,  `${chaser} đang rút ngắn khoảng cách với ${leader}!`],
      ];
      for (const [cp, msg] of checkpoints) {
        const key = `cp-${cp}`;
        if (!commentaryTriggersRef.current.has(key) && leaderProgress >= cp) {
          commentaryTriggersRef.current.add(key);
          addCommentary(msg);
        }
      }
    }, 300);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceState, fullRace?.laps, addCommentary]);

  const startRace = () => {
    progressSvs.forEach(sv => { sv.value = 0; });
    finishedCountSv.value = 0;
    finishTimesRef.current = {};
    finishOrderRef.current = [];
    commentaryTriggersRef.current = new Set();
    raceFinishedRef.current = false;
    prevRanksRef.current = {};
    setCommentary([`🚩 Cờ xuất phát! ${entriesRef.current.length} kỵ sĩ bắt đầu tranh tài!`]);
    setLapProgress(0);
    setRaceState('racing');
    isRacingSv.value = true;
    frameCallback.setActive(true);
  };

  const laps = fullRace?.laps ?? 1;
  const currentLap = Math.min(Math.floor(lapProgress * laps) + 1, laps);
  const activeCount = entriesRef.current.length;

  return (
    <ScrollView contentContainerStyle={styles.liveScrollContent} showsVerticalScrollIndicator={false}>

      {/* My rank card */}
      <Animated.View entering={FadeIn.duration(350)}>
        <LinearGradient colors={['#3B0000', '#7B1800', '#C04000']} style={styles.myRankCard}>
          <View style={styles.myRankBgCircle} />
          <Text style={styles.myRankLabel}>VỊ TRÍ CỦA BẠN</Text>
          <Text style={styles.myRankNumber}>#{myRank}</Text>
          <Text style={styles.myRankHorse}>{jockeyRace.myEntry.horse.name}</Text>
          {raceState === 'racing' && (
            <Text style={styles.myRankGap}>
              Cách dẫn đầu: {gapToLeader < 0.01 ? 'Đang dẫn!' : `${(gapToLeader / laps * 100).toFixed(1)}% vòng đua`}
            </Text>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Track */}
      {fullRace && (
        <RaceLaneTrack
          entries={fullRace.entries.slice(0, MAX_HORSES)}
          progressSvs={progressSvs.slice(0, activeCount)}
          laps={fullRace.laps}
          highlightIndex={highlightIndex >= 0 ? highlightIndex : undefined}
        />
      )}

      {/* Lap progress */}
      {raceState !== 'idle' && (
        <View style={styles.lapRow}>
          <Text style={styles.lapText}>Vòng {currentLap} / {laps}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(lapProgress * 100)}%` as `${number}%` }]} />
          </View>
          <Text style={styles.lapPct}>{Math.round(lapProgress * 100)}%</Text>
        </View>
      )}

      {/* Commentary */}
      {commentary.length > 0 && <Commentary lines={commentary} />}

      {/* Standings */}
      <LiveStandings standings={standings} raceState={raceState} />

      {/* CTA */}
      <View style={styles.ctaRow}>
        {raceState === 'idle' && (
          <TouchableOpacity style={styles.startBtn} onPress={startRace} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Bắt đầu xem mô phỏng</Text>
          </TouchableOpacity>
        )}
        {raceState === 'racing' && (
          <View style={styles.racingIndicator}>
            <View style={styles.racingDot} />
            <Text style={styles.racingText}>Đang đua...</Text>
          </View>
        )}
        {raceState === 'finished' && (
          <TouchableOpacity style={styles.backFullBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.backFullBtnText}>Quay về</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// ─── Phase 3: Post-race ───────────────────────────────────────────────────────
function PostRaceView({ jockeyRace, fullRace }: { jockeyRace: JockeyRace; fullRace: Race | null }) {
  const { position, finishTime, horse } = jockeyRace.myEntry;
  const isTopThree = position !== undefined && position <= 3;
  const prizeEstimate = position === 1 ? jockeyRace.purse * 0.5
    : position === 2 ? jockeyRace.purse * 0.3
    : position === 3 ? jockeyRace.purse * 0.15
    : 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Rank banner */}
      <Animated.View entering={FadeIn.duration(400)}>
        <LinearGradient
          colors={isTopThree ? ['#1A4D2E', '#2D6741'] : ['#2A2A2A', '#3A3A3A']}
          style={styles.resultBanner}>
          <View style={styles.resultBannerInner}>
            {position !== undefined && <MedalIcon position={position} size={48} />}
            <View style={{ gap: 4 }}>
              <Text style={styles.resultRankText}>
                {position !== undefined ? `VỊ TRÍ #${position}` : 'KẾT THÚC'}
              </Text>
              <Text style={styles.resultHorseName}>{horse.name}</Text>
              {finishTime && <Text style={styles.resultTime}>⏱ {finishTime}</Text>}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Earnings */}
      {prizeEstimate > 0 && (
        <Animated.View entering={FadeInDown.delay(80).duration(360)}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thu nhập</Text>
            <Text style={styles.earningsAmount}>+{formatCurrency(prizeEstimate)}</Text>
            <Text style={styles.earningsNote}>Ước tính phần thưởng</Text>
          </View>
        </Animated.View>
      )}

      {/* Full results */}
      {fullRace && (
        <Animated.View entering={FadeInDown.delay(160).duration(360)}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kết quả đầy đủ</Text>
            {[...fullRace.entries]
              .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
              .map(entry => {
                const isMe = entry.horse.number === jockeyRace.myEntry.horse.number;
                return (
                  <View key={entry.horse.id} style={[styles.entryRow, isMe && styles.entryRowMe]}>
                    <View style={styles.entryRankCol}>
                      {entry.position !== undefined && entry.position <= 3
                        ? <MedalIcon position={entry.position} size={18} />
                        : <Text style={styles.entryRankNum}>{entry.position ?? '–'}</Text>}
                    </View>
                    <View style={[styles.entryColorBar, { backgroundColor: entry.horse.color }]} />
                    <View style={styles.entryInfo}>
                      <Text style={[styles.entryName, isMe && styles.entryNameMe]}>{entry.horse.name}</Text>
                      <Text style={styles.entryJockey}>{isMe ? '← Bạn' : entry.jockeyName}</Text>
                    </View>
                    {entry.finishTime && (
                      <Text style={styles.entryTime}>{entry.finishTime}</Text>
                    )}
                  </View>
                );
              })}
          </View>
        </Animated.View>
      )}

      {/* Return button */}
      <Animated.View entering={FadeInDown.delay(240).duration(360)}>
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => router.push('/jockey/schedule')}
          activeOpacity={0.85}>
          <Text style={styles.returnBtnText}>Quay về Lịch đua</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function CountdownUnit({ value, unit }: { value: string; unit: string }) {
  return (
    <View style={styles.countdownUnit}>
      <Text style={styles.countdownDigit}>{value}</Text>
      <Text style={styles.countdownUnitLabel}>{unit}</Text>
    </View>
  );
}

function ConditionCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.conditionCell}>
      {icon}
      <Text style={styles.conditionLabel}>{label}</Text>
      <Text style={styles.conditionValue}>{value}</Text>
    </View>
  );
}

function calcTimeLeft(date: string, time: string) {
  const target = new Date(`${date}T${time}:00`).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { hh: '00', mm: '00', ss: '00', started: true };
  const totalSecs = Math.floor(diff / 1000);
  const hh = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSecs % 60).padStart(2, '0');
  return { hh, mm, ss, started: false };
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: SC.lowest },
  safeArea:  { flex: 1 },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, backgroundColor: SC.high, gap: Spacing.two },
  backBtn:        { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { flex: 1, color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: C.error },
  statusBadgeText:{ fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.6 },

  // Scroll containers
  scrollContent:     { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },
  liveScrollContent: { paddingTop: Spacing.two, paddingBottom: Spacing.five, gap: Spacing.two },

  // Countdown
  countdownCard:    { borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: Spacing.two },
  countdownLabel:   { color: 'rgba(255,255,255,0.6)', fontFamily: FontFamily.medium, fontSize: 13 },
  countdownRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  countdownUnit:    { alignItems: 'center', gap: 2 },
  countdownDigit:   { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 44, letterSpacing: -1 },
  countdownUnitLabel:{ color: 'rgba(255,255,255,0.5)', fontFamily: FontFamily.medium, fontSize: 9, letterSpacing: 1 },
  countdownColon:   { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 40, marginBottom: 10 },
  countdownStarted: { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 20 },

  // Card
  card:      { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  cardTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },

  // Venue
  venueRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, paddingVertical: 4 },
  venueInfo:    { flex: 1, gap: 2 },
  venueName:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },
  venueAddress: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },

  // Horse
  horseRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  horseSwatch: { width: 56, height: 56, borderRadius: Shape.medium },
  horseInfo: { flex: 1, gap: 4 },
  horseName: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 18 },
  horseMeta: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },
  horseDetailsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one, marginTop: Spacing.one },
  horseDetailCell:   { backgroundColor: SC.highest, borderRadius: Shape.medium, paddingHorizontal: 10, paddingVertical: 6, gap: 2 },
  horseDetailHealth: { flex: 1 },
  horseDetailLabel:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  horseDetailValue:  { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },

  // Conditions
  conditionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  conditionCell:   { flex: 1, minWidth: '45%', backgroundColor: SC.highest, borderRadius: Shape.medium, padding: Spacing.two, gap: 4 },
  conditionLabel:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  conditionValue:  { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },

  // Entry row
  entryRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 6 },
  entryRowMe:     { backgroundColor: `${C.primary}15`, borderRadius: Shape.medium, paddingHorizontal: Spacing.one, borderLeftWidth: 3, borderLeftColor: C.primary },
  entryColorBar:  { width: 4, height: 36, borderRadius: 2 },
  entryNumber:    { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 12, width: 24 },
  entryInfo:      { flex: 1, gap: 2 },
  entryName:      { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  entryNameMe:    { color: C.primary, fontFamily: FontFamily.bold },
  entryJockey:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  entryOdds:      { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 12 },
  entryRankCol:   { width: 28, alignItems: 'center' },
  entryRankNum:   { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 13 },
  entryTime:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },

  // My rank card (live phase)
  myRankCard:     { marginHorizontal: Spacing.three, marginTop: Spacing.two, borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: 4, overflow: 'hidden' },
  myRankBgCircle: { position: 'absolute', right: -32, top: -32, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)' },
  myRankLabel:    { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.medium, fontSize: 11, letterSpacing: 1 },
  myRankNumber:   { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 72, lineHeight: 80, letterSpacing: -2 },
  myRankHorse:    { color: 'rgba(255,217,180,0.9)', fontFamily: FontFamily.bold, fontSize: 15 },
  myRankGap:      { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 12, marginTop: 2 },

  // Lap row
  lapRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  lapText:        { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 11, width: 72 },
  progressTrack:  { flex: 1, height: 4, backgroundColor: SC.highest, borderRadius: Shape.full, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: C.tertiary, borderRadius: Shape.full },
  lapPct:         { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 11, width: 30, textAlign: 'right' },

  // CTA row (live)
  ctaRow:          { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three },
  startBtn:        { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  startBtnText:    { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 15 },
  racingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: 14 },
  racingDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.error },
  racingText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 14 },
  backFullBtn:     { borderWidth: 1, borderColor: C.onSurfaceVariant, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  backFullBtnText: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },

  // Post-race
  resultBanner:       { borderRadius: Shape.large, padding: Spacing.three },
  resultBannerInner:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  resultRankText:     { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 18 },
  resultHorseName:    { color: 'rgba(255,255,255,0.8)', fontFamily: FontFamily.medium, fontSize: 14 },
  resultTime:         { color: 'rgba(255,255,255,0.7)', fontFamily: FontFamily.regular, fontSize: 13 },
  earningsAmount:     { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 28, letterSpacing: -0.5 },
  earningsNote:       { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  returnBtn:          { backgroundColor: C.primaryContainer, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  returnBtnText:      { color: C.primary, fontFamily: FontFamily.bold, fontSize: 15 },
});
