import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import { LiveViewer } from './live-viewer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CalendarPlus } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import type { Race } from '@/types/race';
import { formatCurrency, formatDate, formatNumber } from '@/utils/format';
import { addRaceEventToCalendar } from '@/utils/calendar';

const PENALTY_LABELS: Record<string, string> = {
  warning: 'Cảnh cáo',
  demote: 'Tụt hạng',
  disqualify: 'Truất quyền thi đấu',
  disqualification: 'Truất quyền thi đấu',
  restart: 'Đua lại',
  time_ban: 'Cấm thi đấu có thời hạn',
  permanent_ban: 'Cấm thi đấu vĩnh viễn',
};

const TARGET_LABELS: Record<'horse' | 'jockey' | 'both', string> = {
  horse: 'Ngựa',
  jockey: 'Nài',
  both: 'Cả hai',
};

type Props = { race: Race; onBack: () => void };

const MEDAL_COLORS = ['#C9971C', '#C0C0C0', '#CD7F32'];

export function RaceDetail({ race, onBack }: Props) {
  const { C, SC } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [isWatching, setIsWatching] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  if (isWatching) {
    return <LiveViewer race={race} onClose={() => setIsWatching(false)} />;
  }

  const isCompleted = race.status === 'completed';
  const isLive = race.status === 'live';
  const isUpcoming = race.status === 'upcoming';
  const isPendingReview = isCompleted && !race.resultPublished;

  async function addToCalendar() {
    setAddingToCalendar(true);
    try {
      const result = await addRaceEventToCalendar({
        title: race.name,
        date: race.date,
        time: race.time,
        location: race.location,
        notes: `Đua ngựa tại ${race.location} — ${race.distance}m, ${race.laps} vòng. Giải thưởng: ${formatCurrency(race.purse)}`,
      });
      if (result.ok) {
        Alert.alert('Đã thêm vào lịch', `"${race.name}" đã được lưu vào lịch của bạn.`);
      } else if (result.reason === 'permission') {
        Alert.alert('Không có quyền', 'Vui lòng cấp quyền truy cập lịch trong Cài đặt.');
      } else if (result.reason === 'no-writable-calendar') {
        Alert.alert('Lỗi', 'Không tìm thấy lịch có thể ghi. Vui lòng kiểm tra ứng dụng lịch.');
      } else {
        Alert.alert('Lỗi', 'Không thể thêm vào lịch. Vui lòng thử lại.');
      }
    } finally {
      setAddingToCalendar(false);
    }
  }
  const sortedEntries = [...race.entries].sort((a, b) => {
    if (!!a.isDisqualified !== !!b.isDisqualified) return a.isDisqualified ? 1 : -1;
    if (a.position && b.position) return a.position - b.position;
    if (a.position) return -1;
    if (b.position) return 1;
    return a.odds - b.odds;
  });
  const showViolations = race.resultPublished && (race.violations?.length ?? 0) > 0;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.root}>
      {/* Header — respects Android status bar */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{race.name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Animated.View entering={FadeInDown.duration(320)}>
          <LinearGradient
            colors={isLive ? ['#003520', '#1A5C3A'] : [SC.base, SC.high]}
            style={styles.banner}>
            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>ĐANG DIỄN RA</Text>
              </View>
            )}
            <Text style={[styles.bannerName, isLive && styles.bannerNameLight]}>{race.name}</Text>
            <View style={styles.bannerGrid}>
              <InfoCell label="Địa điểm" value={race.location} light={isLive} />
              <InfoCell label="Khoảng cách" value={`${race.distance}m`} light={isLive} />
              <InfoCell label="Số vòng" value={`${race.laps} vòng`} light={isLive} />
              <InfoCell label="Mặt đường" value={race.surface} light={isLive} />
              <InfoCell label="Ngày" value={formatDate(race.date)} light={isLive} />
              <InfoCell label="Giờ" value={race.time} light={isLive} />
              <InfoCell label="Giải thưởng" value={formatNumber(race.purse)} light={isLive} />
              <InfoCell label="Kỵ sĩ" value={`${race.entries.length}`} light={isLive} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Entries */}
        <Animated.View entering={FadeInDown.delay(80).duration(320)}>
          <Text style={styles.sectionTitle}>
            {isPendingReview ? 'Kết quả tạm thời (chưa chính thức)'
              : isCompleted ? 'Kết quả chính thức'
              : isUpcoming ? 'Ngựa tham gia'
              : 'Thứ hạng hiện tại'}
          </Text>
          {isPendingReview && (
            <Text style={styles.pendingReviewText}>
              Cuộc đua đã kết thúc. Đang chờ trọng tài kiểm tra VAR và xác nhận kết quả trước khi công bố...
            </Text>
          )}
          {sortedEntries.map((entry, idx) => (
            <View key={entry.horse.id} style={[styles.entryRow, entry.isDisqualified && styles.entryRowDisqualified]}>
              <View style={styles.entryRank}>
                {entry.isDisqualified
                  ? <Text style={styles.entryTextDisqualified}>—</Text>
                  : entry.position
                  ? <Text style={[styles.rankNum, entry.position <= 3 && { color: MEDAL_COLORS[entry.position - 1] }]}>#{entry.position}</Text>
                  : isCompleted
                  ? <Text style={styles.rankDash}>—</Text>
                  : isUpcoming
                  ? null
                  : <Text style={[styles.rankNum, idx < 3 && { color: MEDAL_COLORS[idx] }]}>#{idx + 1}</Text>}
              </View>
              <View style={[styles.horseColor, { backgroundColor: entry.horse.color }]} />
              <View style={styles.entryInfo}>
                <Text style={[styles.entryHorseName, entry.isDisqualified && styles.entryTextDisqualified]}>
                  {entry.horse.name}
                </Text>
                {!!entry.jockeyName && (
                  <Text style={[styles.entryJockey, entry.isDisqualified && styles.entryTextDisqualified]}>{entry.jockeyName}</Text>
                )}
              </View>
              <View style={styles.entryRight}>
                {entry.finishTime && (
                  <Text style={[styles.finishTime, entry.isDisqualified && styles.entryTextDisqualified]}>{entry.finishTime}</Text>
                )}
              </View>
            </View>
          ))}
        </Animated.View>

        {showViolations && (
          <Animated.View entering={FadeInDown.delay(120).duration(320)}>
            <Text style={styles.sectionTitle}>Vi phạm ghi nhận</Text>
            {race.violations!.map((v, idx) => (
              <View key={idx} style={styles.violationRow}>
                <View style={styles.violationHeader}>
                  <Text style={styles.violationHorse}>
                    {v.target === 'jockey' ? (v.jockeyName ?? 'Không rõ') : (v.horseName ?? 'Không rõ')}
                  </Text>
                  <View style={[styles.targetBadge, v.target === 'jockey' ? styles.targetBadgeJockey : styles.targetBadgeHorse]}>
                    <Text style={[styles.targetBadgeText, v.target === 'jockey' ? styles.targetBadgeTextJockey : styles.targetBadgeTextHorse]}>
                      {TARGET_LABELS[v.target]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.violationDesc}>{v.description}</Text>
                {v.penaltyApplied && (
                  <Text style={styles.violationPenalty}>{PENALTY_LABELS[v.penaltyApplied] ?? v.penaltyApplied}</Text>
                )}
              </View>
            ))}
          </Animated.View>
        )}

        {isLive && (
          <TouchableOpacity style={styles.ticketBtn} onPress={() => setIsWatching(true)}>
            <Text style={styles.ticketBtnText}>Xem trực tiếp</Text>
          </TouchableOpacity>
        )}
        {isCompleted && (
          <TouchableOpacity style={styles.ticketBtn} onPress={() => setIsWatching(true)}>
            <Text style={styles.ticketBtnText}>Xem lại mô phỏng đua</Text>
          </TouchableOpacity>
        )}
        {race.status === 'upcoming' && (
          <TouchableOpacity
            style={[styles.calendarBtn, addingToCalendar && styles.calendarBtnDisabled]}
            onPress={addToCalendar}
            disabled={addingToCalendar}
            activeOpacity={0.8}>
            <CalendarPlus size={18} color={C.onPrimary} />
            <Text style={styles.calendarBtnText}>
              {addingToCalendar ? 'Đang thêm...' : 'Thêm vào lịch'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Animated.View>
  );
}

function InfoCell({ label, value, light }: { label: string; value: string; light?: boolean }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.infoCell}>
      <Text style={[styles.infoCellLabel, light && styles.infoCellLabelLight]}>{label}</Text>
      <Text style={[styles.infoCellValue, light && styles.infoCellValueLight]}>{value}</Text>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:   { flex: 1, backgroundColor: SC.lowest },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: SC.high, paddingHorizontal: Spacing.two, paddingBottom: Spacing.two,
  },
  backBtn:     { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 16, flex: 1, textAlign: 'center' },
  scroll:      { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  // Banner
  banner:     { borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  liveBadge:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, alignSelf: 'flex-start', backgroundColor: C.error, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  liveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveBadgeText: { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  bannerName:      { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 20 },
  bannerNameLight: { color: '#FFFFFF' },
  bannerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  infoCell:   { width: '46%' },
  infoCellLabel:     { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  infoCellValue:     { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, marginTop: 1 },
  infoCellLabelLight:{ color: 'rgba(255,255,255,0.55)' },
  infoCellValueLight:{ color: '#FFFFFF' },

  // Entries
  sectionTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, marginBottom: Spacing.two },
  pendingReviewText: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 13, marginBottom: Spacing.two },
  entryRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, marginBottom: Spacing.two, gap: Spacing.two },
  entryRowDisqualified: { backgroundColor: `${C.error}15` },
  entryTextDisqualified: { color: C.error },
  entryRank:    { width: 32, alignItems: 'center' },
  rankNum:      { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 16 },
  rankDash:     { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 16 },
  horseColor:   { width: 4, height: 40, borderRadius: 2 },
  entryInfo:    { flex: 1 },
  entryHorseName:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  entryJockey:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, marginTop: 2 },
  entryRight:   { alignItems: 'flex-end', gap: 4 },
  oddsBadge:    { backgroundColor: C.primaryContainer, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 3 },
  oddsText:     { color: C.onPrimaryContainer, fontFamily: FontFamily.bold, fontSize: 12 },
  finishTime:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  violationRow:     { backgroundColor: `${C.error}15`, borderRadius: Shape.large, padding: Spacing.two, marginBottom: Spacing.two, gap: 2 },
  violationHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  violationHorse:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13 },
  violationDesc:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  violationPenalty: { color: C.error, fontFamily: FontFamily.bold, fontSize: 11 },
  targetBadge:          { borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  targetBadgeJockey:    { backgroundColor: C.secondaryContainer },
  targetBadgeHorse:     { backgroundColor: C.tertiaryContainer },
  targetBadgeText:      { fontFamily: FontFamily.bold, fontSize: 10 },
  targetBadgeTextJockey: { color: C.onSecondaryContainer },
  targetBadgeTextHorse:  { color: C.onTertiaryContainer },
  ticketBtn:          { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  ticketBtnText:      { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 14 },
  calendarBtn:        { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: Spacing.two },
  calendarBtnDisabled:{ opacity: 0.6 },
  calendarBtnText:    { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 14 },
  });
}
