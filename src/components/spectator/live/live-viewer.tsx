import { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, useFrameCallback, runOnJS } from 'react-native-reanimated';
import { X } from 'lucide-react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import type { Race, RaceEntry } from '@/mock-data';
import { RaceLaneTrack } from './race-lane-track';
import { LiveStandings } from './live-standings';
import { Commentary } from './commentary';

export type RaceState = 'idle' | 'racing' | 'finished';

export type StandingEntry = {
  entry: RaceEntry;
  progress: number;
  rank: number;
  previousRank: number;
  finished: boolean;
  finishTime?: string;
};

type Props = { race: Race; onClose: () => void };

// laps / (SPEED_CONSTANT * 60000ms) ≈ 2 / (0.0000333 * 60000) = 1.0 → fastest finishes ~60s
const SPEED_CONSTANT = 0.0000333;
const MAX_HORSES = 10;

function formatFinishTime(ms: number): string {
  const totalSecs = ms / 1000;
  const mins = Math.floor(totalSecs / 60);
  const secs = (totalSecs % 60).toFixed(1).padStart(4, '0');
  return `${mins}:${secs}`;
}

export function LiveViewer({ race, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [raceState, setRaceState] = useState<RaceState>('idle');
  const [standings, setStandings] = useState<StandingEntry[]>(
    race.entries.map((e, i) => ({ entry: e, progress: 0, rank: i + 1, previousRank: i + 1, finished: false })),
  );
  const [commentary, setCommentary] = useState<string[]>([]);
  const [lapProgress, setLapProgress] = useState(0);

  // JS-only refs (NOT captured by worklets)
  const finishTimesRef = useRef<Record<string, string>>({});
  const finishOrderRef = useRef<string[]>([]);
  const prevRanksRef = useRef<Record<string, number>>({});
  const commentaryTriggersRef = useRef<Set<string>>(new Set());
  const raceFinishedRef = useRef(false);
  const entriesRef = useRef<RaceEntry[]>(race.entries.slice(0, MAX_HORSES));

  // ── Progress shared values (10 horses, unconditional) ──────────────────────
  const sv0 = useSharedValue(0); const sv1 = useSharedValue(0);
  const sv2 = useSharedValue(0); const sv3 = useSharedValue(0);
  const sv4 = useSharedValue(0); const sv5 = useSharedValue(0);
  const sv6 = useSharedValue(0); const sv7 = useSharedValue(0);
  const sv8 = useSharedValue(0); const sv9 = useSharedValue(0);
  const progressSvs = [sv0, sv1, sv2, sv3, sv4, sv5, sv6, sv7, sv8, sv9];

  // ── Speed shared values (one per horse slot) ───────────────────────────────
  const sp0 = useSharedValue(0); const sp1 = useSharedValue(0);
  const sp2 = useSharedValue(0); const sp3 = useSharedValue(0);
  const sp4 = useSharedValue(0); const sp5 = useSharedValue(0);
  const sp6 = useSharedValue(0); const sp7 = useSharedValue(0);
  const sp8 = useSharedValue(0); const sp9 = useSharedValue(0);
  const speedSvs = [sp0, sp1, sp2, sp3, sp4, sp5, sp6, sp7, sp8, sp9];

  // ── Jitter shared values ───────────────────────────────────────────────────
  const jt0 = useSharedValue(0); const jt1 = useSharedValue(0);
  const jt2 = useSharedValue(0); const jt3 = useSharedValue(0);
  const jt4 = useSharedValue(0); const jt5 = useSharedValue(0);
  const jt6 = useSharedValue(0); const jt7 = useSharedValue(0);
  const jt8 = useSharedValue(0); const jt9 = useSharedValue(0);
  const jitterSvs = [jt0, jt1, jt2, jt3, jt4, jt5, jt6, jt7, jt8, jt9];

  // ── Worklet-safe state ─────────────────────────────────────────────────────
  const isRacingSv      = useSharedValue(false);
  const horseCountSv    = useSharedValue(race.entries.slice(0, MAX_HORSES).length);
  const raceLapsSv      = useSharedValue(race.laps);
  const finishedCountSv = useSharedValue(0);
  const horseIdsSv      = useSharedValue<string[]>(race.entries.slice(0, MAX_HORSES).map(e => e.horse.id));

  // ── JS callbacks (called via runOnJS from worklet) ─────────────────────────
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

  // ── Frame callback — only accesses shared values, no JS refs ──────────────
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
        // Race ends when the FIRST horse crosses the finish line
        if (finishedCountSv.value === 1) {
          runOnJS(onRaceComplete)();
        }
      } else {
        progressSvs[i].value = next;
      }
    }
  }, false);

  // ── Sync horse params into shared values when race changes ─────────────────
  useEffect(() => {
    const entries = race.entries.slice(0, MAX_HORSES);
    entriesRef.current = entries;
    const minOdds = Math.min(...entries.map(e => e.odds));
    const maxOdds = Math.max(...entries.map(e => e.odds));
    const oddsRange = maxOdds - minOdds || 1;
    entries.forEach((e, i) => {
      // Compress to ±20% spread: fastest = SPEED_CONSTANT, slowest = SPEED_CONSTANT * 0.80
      const normalized = 1 - 0.20 * (e.odds - minOdds) / oddsRange;
      speedSvs[i].value  = SPEED_CONSTANT * normalized;
      jitterSvs[i].value = (((i * 7 + 3) % 10) - 5) * 0.000004;
    });
    horseCountSv.value = entries.length;
    raceLapsSv.value   = race.laps;
    horseIdsSv.value   = entries.map(e => e.horse.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [race.id]);

  // ── Standings + commentary update every 300ms ──────────────────────────────
  useEffect(() => {
    if (raceState !== 'racing') return;
    const interval = setInterval(() => {
      const entries = entriesRef.current;
      const laps = race.laps;
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
  }, [raceState, race.laps, addCommentary]);

  // ── Start race ─────────────────────────────────────────────────────────────
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

  const currentLap = Math.min(Math.floor(lapProgress * race.laps) + 1, race.laps);
  const activeCount = race.entries.slice(0, MAX_HORSES).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={20} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{race.name}</Text>
        {raceState === 'racing' ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>TRỰC TIẾP</Text>
          </View>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Track */}
      <RaceLaneTrack
        entries={race.entries.slice(0, MAX_HORSES)}
        progressSvs={progressSvs.slice(0, activeCount)}
        laps={race.laps}
      />

      {/* Lap progress bar */}
      {raceState !== 'idle' && (
        <View style={styles.lapRow}>
          <Text style={styles.lapText}>Vòng {currentLap} / {race.laps}</Text>
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

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        {raceState === 'idle' && (
          <TouchableOpacity style={styles.ctaBtn} onPress={startRace} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>Bắt đầu xem</Text>
          </TouchableOpacity>
        )}
        {raceState === 'racing' && (
          <View style={styles.racingIndicator}>
            <View style={styles.racingDot} />
            <Text style={styles.racingText}>Đang đua...</Text>
          </View>
        )}
        {raceState === 'finished' && (
          <TouchableOpacity style={styles.closeFullBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeFullBtnText}>Đóng</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: SC.lowest },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, backgroundColor: SC.high, gap: Spacing.two },
  closeBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { flex: 1, color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  headerSpacer: { width: 60 },
  liveBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${C.error}30`, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: C.error },
  liveBadgeText:{ color: C.error, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },

  lapRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  lapText:       { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 11, width: 72 },
  progressTrack: { flex: 1, height: 4, backgroundColor: SC.highest, borderRadius: Shape.full, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: C.tertiary, borderRadius: Shape.full },
  lapPct:        { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 11, width: 30, textAlign: 'right' },

  bottomBar:       { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, backgroundColor: SC.high },
  ctaBtn:          { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  ctaBtnText:      { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 15 },
  racingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: 14 },
  racingDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.error },
  racingText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 14 },
  closeFullBtn:    { borderWidth: 1, borderColor: C.onSurfaceVariant, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  closeFullBtnText:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
});
