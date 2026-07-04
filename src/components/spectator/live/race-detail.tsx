import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import * as Calendar from 'expo-calendar/legacy';
import { LiveViewer } from './live-viewer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CalendarPlus } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import type { Race } from '@/types/race';
import { formatCurrency, formatDate } from '@/utils/format';
import { spectatorApi } from '@/api/spectator.api';
import { MedalIcon } from '@/components/ui/medal-icon';

type Props = { race: Race; onBack: () => void };

export function RaceDetail({ race, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [isWatching, setIsWatching] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  if (isWatching) {
    return <LiveViewer race={race} onClose={() => setIsWatching(false)} />;
  }

  const isCompleted = race.status === 'completed';
  const isLive = race.status === 'live';

  async function addToCalendar() {
    setAddingToCalendar(true);
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Không có quyền', 'Vui lòng cấp quyền truy cập lịch trong Cài đặt.');
        return;
      }

      const [year, month, day] = race.date.split('-').map(Number);
      const [hours, minutes] = race.time.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes, 0);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      let calendarId: string;
      if (Platform.OS === 'ios') {
        const cal = await Calendar.getDefaultCalendarAsync();
        calendarId = cal.id;
      } else {
        const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const writable = cals.find(c => c.allowsModifications);
        if (!writable) {
          Alert.alert('Lỗi', 'Không tìm thấy lịch có thể ghi. Vui lòng kiểm tra ứng dụng lịch.');
          return;
        }
        calendarId = writable.id;
      }

      await Calendar.createEventAsync(calendarId, {
        title: race.name,
        startDate,
        endDate,
        location: race.location,
        notes: `Đua ngựa tại ${race.location} — ${race.distance}m, ${race.laps} vòng. Giải thưởng: ${formatCurrency(race.purse)}`,
        timeZone: 'Asia/Ho_Chi_Minh',
      });

      Alert.alert('Đã thêm vào lịch', `"${race.name}" đã được lưu vào lịch của bạn.`);
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm vào lịch. Vui lòng thử lại.');
    } finally {
      setAddingToCalendar(false);
    }
  }
  const sortedEntries = [...race.entries].sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    if (a.position) return -1;
    if (b.position) return 1;
    return a.odds - b.odds;
  });

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
            colors={isLive ? ['#003520', '#1A5C3A'] : ['#1C1409', '#302015']}
            style={styles.banner}>
            {isLive && (
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>ĐANG DIỄN RA</Text>
              </View>
            )}
            <Text style={styles.bannerName}>{race.name}</Text>
            <View style={styles.bannerGrid}>
              <InfoCell label="Địa điểm" value={race.location} light={isLive} />
              <InfoCell label="Khoảng cách" value={`${race.distance}m`} light={isLive} />
              <InfoCell label="Số vòng" value={`${race.laps} vòng`} light={isLive} />
              <InfoCell label="Mặt đường" value={race.surface} light={isLive} />
              <InfoCell label="Ngày" value={formatDate(race.date)} light={isLive} />
              <InfoCell label="Giờ" value={race.time} light={isLive} />
              <InfoCell label="Giải thưởng" value={formatCurrency(race.purse)} light={isLive} />
              <InfoCell label="Kỵ sĩ" value={`${race.entries.length}`} light={isLive} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Entries */}
        <Animated.View entering={FadeInDown.delay(80).duration(320)}>
          <Text style={styles.sectionTitle}>
            {isCompleted ? 'Kết quả chính thức' : 'Thứ hạng hiện tại'}
          </Text>
          {sortedEntries.map((entry, idx) => (
            <View key={entry.horse.id} style={styles.entryRow}>
              <View style={styles.entryRank}>
                {entry.position && entry.position <= 3
                  ? <MedalIcon position={entry.position} size={18} />
                  : <Text style={styles.rankNum}>{entry.position ?? idx + 1}</Text>}
              </View>
              <View style={[styles.horseColor, { backgroundColor: entry.horse.color }]} />
              <View style={styles.entryInfo}>
                <Text style={styles.entryHorseName}>
                  #{entry.horse.number} {entry.horse.name}
                </Text>
                <Text style={styles.entryJockey}>{entry.jockeyName}</Text>
              </View>
              <View style={styles.entryRight}>
                <View style={styles.oddsBadge}>
                  <Text style={styles.oddsText}>{entry.odds.toFixed(1)}x</Text>
                </View>
                {entry.finishTime && (
                  <Text style={styles.finishTime}>{entry.finishTime}</Text>
                )}
              </View>
            </View>
          ))}
        </Animated.View>

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
  return (
    <View style={styles.infoCell}>
      <Text style={[styles.infoCellLabel, light && styles.infoCellLabelLight]}>{label}</Text>
      <Text style={[styles.infoCellValue, light && styles.infoCellValueLight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  liveRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  liveDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: C.error },
  liveText:   { color: C.error, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1 },
  bannerName: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 20 },
  bannerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  infoCell:   { width: '46%' },
  infoCellLabel:     { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  infoCellValue:     { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, marginTop: 1 },
  infoCellLabelLight:{ color: 'rgba(255,255,255,0.55)' },
  infoCellValueLight:{ color: '#FFFFFF' },

  // Entries
  sectionTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, marginBottom: Spacing.two },
  entryRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, marginBottom: Spacing.two, gap: Spacing.two },
  entryRank:    { width: 32, alignItems: 'center' },
  rankNum:      { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 16 },
  horseColor:   { width: 4, height: 40, borderRadius: 2 },
  entryInfo:    { flex: 1 },
  entryHorseName:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  entryJockey:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, marginTop: 2 },
  entryRight:   { alignItems: 'flex-end', gap: 4 },
  oddsBadge:    { backgroundColor: C.primaryContainer, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 3 },
  oddsText:     { color: C.onPrimaryContainer, fontFamily: FontFamily.bold, fontSize: 12 },
  finishTime:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  ticketBtn:          { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  ticketBtnText:      { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 14 },
  calendarBtn:        { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: Spacing.two },
  calendarBtnDisabled:{ opacity: 0.6 },
  calendarBtnText:    { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 14 },
});
