import { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { X } from 'lucide-react-native';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import type { Race, RaceEntry } from '@/types/race';
import { spectatorApi } from '@/api/spectator.api';
import {
  computeFrame, fmtClock, lengthsBehind, paceWeights,
  type RaceFrame, type RaceSimHorse, type HorseFrame,
} from '@/utils/raceSim';

// 'idle' is unused by this component but kept for jockey/race-day.tsx, which imports this
// type and has its own separate 'idle' initial state for its own (unrelated) simulation view.
export type RaceState = 'idle' | 'waiting' | 'racing' | 'finished';
type WaitingReason = 'not-started' | 'loading-live';

export type StandingEntry = {
  entry: RaceEntry;
  progress: number;
  rank: number;
  previousRank: number;
  finished: boolean;
  finishTime?: string;
};

type DisplayResult = {
  horseId: string;
  horseName: string;
  jockeyName: string;
  clothNumber: number;
  rank: number;
  finishTime?: number;
  isDisqualified?: boolean;
};

/** Kết quả chính thức (đã công bố) — ưu tiên finishTime thật đã lưu ở backend, dự phòng bằng kết quả mô phỏng tạm thời nếu có. */
function buildOfficialResult(
  entries: RaceEntry[],
  rankingByHorse: Map<string, { rank: number; isDisqualified?: boolean; finishTime?: number }>,
  provisionalHorses: RaceSimHorse[],
): { horses: DisplayResult[]; excluded: RaceEntry[] } {
  const provisionalByHorse = new Map(provisionalHorses.map(h => [h.horseId, h]));
  const horses: DisplayResult[] = [];
  const excluded: RaceEntry[] = [];
  for (const e of entries) {
    const r = rankingByHorse.get(e.horse.id);
    const isDisqualified = !r || !!r.isDisqualified;
    horses.push({
      horseId: e.horse.id,
      horseName: e.horse.name,
      jockeyName: e.jockeyName,
      clothNumber: e.horse.number,
      rank: r?.rank ?? Number.MAX_SAFE_INTEGER,
      finishTime: r?.finishTime ?? provisionalByHorse.get(e.horse.id)?.finishTime,
      isDisqualified,
    });
    if (isDisqualified) excluded.push(e);
  }
  return { horses, excluded };
}

/** So sánh thứ tự về đích + danh sách bị loại giữa 2 bộ kết quả — dùng để báo "kết quả đã cập nhật". */
function resultsDiffer(
  a: DisplayResult[], aExcluded: RaceEntry[],
  b: DisplayResult[], bExcluded: RaceEntry[],
): boolean {
  const orderA = [...a].sort((x, y) => x.rank - y.rank).map(h => h.horseId).join(',');
  const orderB = [...b].sort((x, y) => x.rank - y.rank).map(h => h.horseId).join(',');
  if (orderA !== orderB) return true;
  const excA = aExcluded.map(e => e.horse.id).sort().join(',');
  const excB = bExcluded.map(e => e.horse.id).sort().join(',');
  return excA !== excB;
}

type Props = { race: Race; onClose: () => void };

const DURATION_MS = 18000;
const SPEEDS = [1, 2, 4] as const;

export function LiveViewer({ race, onClose }: Props) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [raceState, setRaceState] = useState<RaceState>('waiting');
  const [waitingReason, setWaitingReason] = useState<WaitingReason>('not-started');
  const [speed, setSpeed] = useState<number>(1);
  const [frame, setFrame] = useState<RaceFrame | null>(null);
  const [speedPct, setSpeedPct] = useState(0);
  const [excludedEntries, setExcludedEntries] = useState<RaceEntry[]>([]);
  const [isOfficial, setIsOfficial] = useState(false);
  const [officialResult, setOfficialResult] = useState<{ horses: DisplayResult[]; excluded: RaceEntry[] } | null>(null);

  const horsesRef = useRef<RaceSimHorse[]>([]);
  const weightsRef = useRef<Record<string, number[]>>({});
  const elapsedRef = useRef(0);
  const speedRef = useRef(1);
  const lastTsRef = useRef<number | null>(null);
  const prevLeadRef = useRef({ p: 0, t: 0 });
  const startedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const startAnimation = useCallback((horses: RaceSimHorse[]) => {
    if (startedRef.current) return;
    startedRef.current = true;
    horsesRef.current = horses;
    weightsRef.current = Object.fromEntries(horses.map(h => [h.horseId, paceWeights(h.horseId)]));
    elapsedRef.current = 0;
    lastTsRef.current = null;
    prevLeadRef.current = { p: 0, t: 0 };
    setRaceState('racing');

    // setInterval (not requestAnimationFrame) so playback keeps advancing even if the
    // screen/tab is temporarily backgrounded — matches native RN behaviour more closely.
    const tick = () => {
      const ts = Date.now();
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const rawDt = Math.min(200, ts - lastTsRef.current);
      const dt = rawDt * speedRef.current;
      lastTsRef.current = ts;
      elapsedRef.current = Math.min(DURATION_MS, elapsedRef.current + dt);

      const f = computeFrame(horsesRef.current, weightsRef.current, elapsedRef.current, DURATION_MS);
      setFrame(f);

      const tSec = elapsedRef.current / 1000;
      const dp = f.leaderProgress - prevLeadRef.current.p;
      const dts = tSec - prevLeadRef.current.t;
      if (dts > 0.05) {
        const inst = (dp / dts) * (DURATION_MS / 1000);
        setSpeedPct(Math.max(8, Math.min(100, Math.round(inst * 85))));
        prevLeadRef.current = { p: f.leaderProgress, t: tSec };
      }

      if (elapsedRef.current >= DURATION_MS || f.done) {
        setSpeedPct(0);
        setRaceState('finished');
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
    };
    intervalRef.current = setInterval(tick, 16);
  }, []);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Poll backend every 3s. The provisional simulation starts playing as soon as the race is
  // 'ongoing' (referee started it); polling never stops afterwards so we can detect the moment
  // the referee confirms VAR and publishes the official result (dto.result), and update the
  // displayed result live if it changes (e.g. a horse gets disqualified for a violation).
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const { race: dto } = await spectatorApi.getRace(race.id);
        if (cancelled) return;

        setIsOfficial(!!dto.result);
        if (dto.result) {
          const rankingByHorse = new Map(dto.result.rankings.map(r => [r.horse.id, r]));
          setOfficialResult(buildOfficialResult(race.entries, rankingByHorse, horsesRef.current));
        } else {
          setOfficialResult(null);
        }

        if (startedRef.current) return; // animation already started/finished — nothing left to gate

        if (dto.status !== 'ongoing' && dto.status !== 'completed') {
          setWaitingReason('not-started');
          setRaceState('waiting');
          return;
        }

        const simData = await spectatorApi.getSimulation(race.id);
        if (cancelled || startedRef.current) return;

        if (simData.available && simData.rankings.length > 0) {
          const horses: RaceSimHorse[] = race.entries
            .map(e => {
              const sim = simData.rankings.find(r => r.horseId === e.horse.id);
              if (!sim || !sim.finishTime) return null;
              return {
                horseId: e.horse.id,
                horseName: e.horse.name,
                jockeyName: e.jockeyName,
                laneNumber: e.horse.number,
                clothNumber: e.horse.number,
                rank: sim.rank,
                finishTime: sim.finishTime,
              };
            })
            .filter((h): h is RaceSimHorse => h !== null);
          if (horses.length > 0) {
            setExcludedEntries(race.entries.filter(e => !simData.rankings.some(r => r.horseId === e.horse.id)));
            startAnimation(horses);
          } else if (dto.result) {
            // Không có dữ liệu mô phỏng thật để animate — kết quả chính thức đã có, nên bỏ
            // qua animation, vào thẳng bảng kết quả cuối thay vì treo màn hình chờ.
            startedRef.current = true;
            setRaceState('finished');
          } else {
            setWaitingReason('loading-live');
            setRaceState('waiting');
          }
        } else if (dto.result) {
          startedRef.current = true;
          setRaceState('finished');
        } else {
          setWaitingReason('loading-live');
          setRaceState('waiting');
        }
      } catch {
        // ignore network errors between polls
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [race.id]);

  const leader = frame?.leader ?? null;
  const distRemaining = frame ? Math.max(0, Math.round((1 - frame.leaderProgress) * race.distance)) : race.distance;

  const showOfficial = isOfficial && officialResult !== null;
  const finishHorses: DisplayResult[] = showOfficial ? officialResult!.horses : horsesRef.current;
  const finishExcluded: RaceEntry[] = showOfficial ? officialResult!.excluded : excludedEntries;
  const resultUpdated = raceState === 'finished' && showOfficial && horsesRef.current.length > 0
    && resultsDiffer(horsesRef.current, excludedEntries, officialResult!.horses, officialResult!.excluded);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={C.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{race.name}</Text>
        </View>
        <View style={styles.headerChips}>
          <Text style={styles.headChip}><Text style={styles.headLabel}>ĐỊA ĐIỂM </Text>{race.location}</Text>
          <Text style={styles.headChip}><Text style={styles.headLabel}>CỰ LY </Text>{race.distance}m</Text>
          <Text style={styles.headChip}><Text style={styles.headLabel}>THỜI GIAN </Text>{fmtClock(frame?.raceTimeSec ?? 0)}</Text>
          <Text style={styles.headChip}><Text style={styles.headLabel}>VÒNG </Text>1/{race.laps}</Text>
        </View>

        {/* Track */}
        <View style={styles.trackWrap}>
          {raceState === 'racing' && (
            <View style={styles.speedCtrl}>
              {SPEEDS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speedBtn, speed === s && styles.speedBtnOn]}
                  onPress={() => setSpeed(s)}
                  activeOpacity={0.8}>
                  <Text style={[styles.speedBtnText, speed === s && styles.speedBtnTextOn]}>{s}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <LinearGradient colors={['#5bb24f', '#4a9b42']} style={styles.field}>
            <Svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Ellipse cx={50} cy={50} rx={42} ry={38} fill="#c89a5e" />
              <Ellipse cx={50} cy={50} rx={28} ry={20} fill="#57aa4c" stroke="#3c7a36" strokeWidth={0.8} />
            </Svg>
            <View style={styles.finishLine} />
            <Text style={styles.finishFlag}>🏁</Text>

            {frame?.horses.map(hf => (
              <HorseMarker key={hf.horse.horseId} hf={hf} isLeader={leader?.horse.horseId === hf.horse.horseId} />
            ))}
          </LinearGradient>
        </View>

        {/* Waiting / racing status */}
        {raceState === 'waiting' && (
          <View style={styles.waitingBox}>
            <ActivityIndicator size="small" color={C.tertiary} />
            <Text style={styles.waitingText}>
              {waitingReason === 'not-started'
                ? 'Chờ trọng tài bắt đầu cuộc đua...'
                : 'Đang tải dữ liệu đua trực tiếp...'}
            </Text>
          </View>
        )}

        {/* Leaderboard */}
        {frame && frame.ranking.length > 0 && (
          <View style={styles.board}>
            <View style={styles.boardTitleRow}>
              <Text style={styles.boardTitle}>BẢNG XẾP HẠNG</Text>
              {!isOfficial && (
                <View style={styles.tempBadge}>
                  <Text style={styles.tempBadgeText}>TẠM THỜI</Text>
                </View>
              )}
            </View>
            <View style={styles.boardHead}>
              <Text style={[styles.boardHeadText, { width: 28 }]}>HẠNG</Text>
              <Text style={[styles.boardHeadText, { flex: 1 }]}>NGỰA</Text>
              <Text style={[styles.boardHeadText, { width: 60, textAlign: 'right' }]}>K.CÁCH</Text>
            </View>
            {frame.ranking.map((hf, i) => (
              <View key={hf.horse.horseId} style={styles.boardRow}>
                <View style={[styles.posBadge, { backgroundColor: hf.color }]}>
                  <Text style={styles.posBadgeText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boardHorseName} numberOfLines={1}>{hf.horse.horseName}</Text>
                  <Text style={styles.boardJockey} numberOfLines={1}>{hf.horse.jockeyName}</Text>
                </View>
                <Text style={styles.boardDist}>
                  {i === 0 ? '—' : `${lengthsBehind(frame.leaderProgress, hf.progress, race.distance).toFixed(1)}L`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom stat panels */}
        {frame && (
          <View style={styles.statsRow}>
            <View style={styles.statPanel}>
              <Text style={styles.statLabel}>DẪN ĐẦU</Text>
              {leader ? (
                <View style={styles.leaderRow}>
                  <View style={[styles.posBadge, { backgroundColor: leader.color }]}>
                    <Text style={styles.posBadgeText}>{leader.horse.clothNumber}</Text>
                  </View>
                  <Text style={styles.leaderName} numberOfLines={1}>{leader.horse.horseName}</Text>
                </View>
              ) : <Text style={styles.statDash}>—</Text>}
              <View style={styles.speedBarOuter}>
                <View style={[styles.speedBarInner, { width: `${speedPct}%` as `${number}%` }]} />
              </View>
            </View>
            <View style={styles.statPanel}>
              <Text style={styles.statLabel}>CÒN LẠI</Text>
              <Text style={styles.statValue}>{distRemaining}m</Text>
            </View>
            <View style={styles.statPanel}>
              <Text style={styles.statLabel}>MẶT SÂN</Text>
              <Text style={styles.statCondition}>🌱 {race.surface}</Text>
            </View>
          </View>
        )}

        {/* Finish overlay */}
        {raceState === 'finished' && (
          <View style={styles.finishCard}>
            <Text style={styles.finishTitle}>
              {showOfficial ? `🏆 Kết quả chính thức — ${race.name}` : `🏁 Kết quả tạm thời — ${race.name}`}
            </Text>
            <Text style={styles.finishSub}>
              {showOfficial
                ? 'Kết quả đã được lưu & công bố. Dự đoán đã được settle.'
                : 'Đây là kết quả tạm thời từ mô phỏng. Đang chờ trọng tài kiểm tra VAR và xác nhận trước khi công bố kết quả chính thức.'}
            </Text>
            {resultUpdated && (
              <Text style={styles.updatedNotice}>⚠️ Kết quả đã được cập nhật sau khi trọng tài xác nhận VAR.</Text>
            )}
            {finishHorses
              .slice()
              .sort((a, b) => {
                if (!!a.isDisqualified !== !!b.isDisqualified) return a.isDisqualified ? 1 : -1;
                return a.rank - b.rank;
              })
              .map(h => (
                <View key={h.horseId} style={styles.finishRow}>
                  <Text style={styles.finishRank}>
                    {h.isDisqualified ? '—' : h.rank === 1 ? '🥇' : h.rank === 2 ? '🥈' : h.rank === 3 ? '🥉' : h.rank}
                  </Text>
                  <Text style={styles.finishHorseName} numberOfLines={1}>{h.horseName}</Text>
                  <Text style={styles.finishJockey} numberOfLines={1}>{h.jockeyName}</Text>
                  <Text style={styles.finishTime}>{h.finishTime != null ? `${h.finishTime.toFixed(2)}s` : '—'}</Text>
                </View>
              ))}
            {finishExcluded.map(e => {
              const violation = race.violations?.find(v => v.horseId === e.horse.id);
              return (
                <View key={e.horse.id} style={styles.excludedRow}>
                  <Text style={styles.excludedText} numberOfLines={2}>
                    ⚠️ #{e.horse.number} {e.horse.name}{' '}
                    {violation ? `bị loại: ${violation.description}` : 'đã vi phạm lỗi nghiêm trọng trong kết quả chung cuộc.'}
                  </Text>
                </View>
              );
            })}
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Xong</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function HorseMarker({ hf, isLeader }: { hf: HorseFrame; isLeader: boolean }) {
  const styles = useThemedStyles(createStyles);
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 170, easing: Easing.inOut(Easing.quad) }), -1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value * -3 }],
  }));

  return (
    <View style={[styles.runner, { left: `${hf.pos.x}%` as `${number}%`, top: `${hf.pos.y}%` as `${number}%` }]}>
      <Text style={[styles.crown, { opacity: isLeader ? 1 : 0 }]}>👑</Text>
      <View style={[styles.numBadge, { backgroundColor: hf.color }]}>
        <Text style={styles.numBadgeText}>{hf.horse.clothNumber}</Text>
      </View>
      <Animated.View style={[{ transform: [{ scaleX: hf.facingLeft ? -1 : 1 }] }, bobStyle]}>
        <Text style={styles.horseEmoji}>🏇</Text>
      </Animated.View>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:  { flex: 1, backgroundColor: SC.lowest },
  scroll:{ paddingHorizontal: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.two },

  header:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.two },
  closeBtn:    { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 17 },

  headerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  headChip:    { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 12 },
  headLabel:   { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 10 },

  trackWrap: { position: 'relative' },
  speedCtrl: { position: 'absolute', top: 8, left: 8, zIndex: 2, gap: 4 },
  speedBtn:  { backgroundColor: SC.high, borderRadius: Shape.small, width: 34, height: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: SC.highest },
  speedBtnOn:{ backgroundColor: '#ffd24a', borderColor: '#ffd24a' },
  speedBtnText:  { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 11 },
  speedBtnTextOn:{ color: '#161d26' },

  field:   { width: '100%', aspectRatio: 3 / 2, borderRadius: Shape.large, overflow: 'hidden', position: 'relative' },
  finishLine: { position: 'absolute', right: '8%', top: '44%', width: 4, height: '12%', backgroundColor: '#fff' },
  finishFlag: { position: 'absolute', right: '3%', top: '42%', fontSize: 16 },

  runner:     { position: 'absolute', alignItems: 'center', transform: [{ translateX: -18 }, { translateY: -45 }] },
  crown:      { fontSize: 12, lineHeight: 14 },
  numBadge:   { minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 1 },
  numBadgeText:{ color: '#fff', fontFamily: FontFamily.bold, fontSize: 9 },
  horseEmoji: { fontSize: 26, lineHeight: 28 },

  waitingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  waitingText:{ color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 13 },

  board:     { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: 2 },
  boardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  boardTitle:    { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.5 },
  tempBadge:     { backgroundColor: `${C.tertiary}22`, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 2 },
  tempBadgeText: { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 9, letterSpacing: 0.5 },
  boardHead: { flexDirection: 'row', gap: Spacing.two, paddingBottom: Spacing.one, borderBottomWidth: 1, borderBottomColor: SC.highest },
  boardHeadText: { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 10 },
  boardRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 5 },
  boardHorseName: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },
  boardJockey:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  boardDist: { width: 60, textAlign: 'right', color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12 },

  posBadge: { minWidth: 24, height: 24, borderRadius: Shape.small, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  posBadgeText: { color: '#fff', fontFamily: FontFamily.bold, fontSize: 11 },

  statsRow:   { flexDirection: 'row', gap: Spacing.two },
  statPanel:  { flex: 1, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: 6 },
  statLabel:  { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 9, letterSpacing: 0.5 },
  statValue:  { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 18 },
  statDash:   { color: C.onSurfaceVariant, fontSize: 13 },
  statCondition: { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 13 },
  leaderRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaderName: { flex: 1, color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 12 },
  speedBarOuter: { height: 8, backgroundColor: SC.lowest, borderRadius: Shape.full, overflow: 'hidden' },
  speedBarInner: { height: '100%', backgroundColor: C.tertiary, borderRadius: Shape.full },

  finishCard:  { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.one },
  finishTitle: { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 16 },
  finishSub:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, marginBottom: Spacing.one },
  updatedNotice: { color: C.tertiary, fontFamily: FontFamily.medium, fontSize: 12, backgroundColor: `${C.tertiary}15`, borderRadius: Shape.medium, padding: Spacing.two, marginBottom: Spacing.one },
  finishRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: SC.lowest, borderRadius: Shape.medium, padding: Spacing.two },
  finishRank:  { width: 24, textAlign: 'center', fontSize: 14 },
  finishHorseName: { flex: 1, color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },
  finishJockey:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  finishTime:      { width: 60, textAlign: 'right', color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12 },
  excludedRow:  { backgroundColor: `${C.error}15`, borderRadius: Shape.medium, padding: Spacing.two },
  excludedText: { color: C.error, fontFamily: FontFamily.medium, fontSize: 12 },
  doneBtn:     { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 12, alignItems: 'center', marginTop: Spacing.one },
  doneBtnText: { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 15 },
  });
}
