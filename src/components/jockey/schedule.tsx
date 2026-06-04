import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Zap } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyAvatarButton } from '@/components/jockey-avatar-button';
import { useJockeyRaces } from '@/hooks/useJockeyData';
import { formatCurrency } from '@/mock-data';

const DAYS   = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

const STATUS_COLOR: Record<string, string> = {
  live:      C.tertiary,
  upcoming:  C.secondary,
  completed: C.onSurfaceVariant,
};
const STATUS_LABEL: Record<string, string> = {
  live:      'Đang đua',
  upcoming:  'Sắp diễn ra',
  completed: 'Đã kết thúc',
};

function buildWeeks(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }
  return weeks;
}

export function JockeySchedule() {
  const { races: jockeyRaces } = useJockeyRaces();
  const today = new Date();
  const [viewYear,    setViewYear]    = useState(today.getFullYear());
  const [viewMonth,   setViewMonth]   = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const raceDays = new Set(
    jockeyRaces
      .map(r => {
        const d = new Date(r.date);
        if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) return d.getDate();
        return null;
      })
      .filter((d): d is number => d !== null)
  );

  const selectedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedRaces = jockeyRaces.filter(r => r.date === selectedDate);

  const weeks = buildWeeks(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Lịch thi đấu" contentContainerStyle={styles.scroll} rightAction={<JockeyAvatarButton />}>

          {/* Calendar card */}
          <View style={styles.calCard}>
            {/* Month nav */}
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
                <ChevronLeft size={20} color={C.onSurface} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
                <ChevronRight size={20} color={C.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.dayHeaders}>
              {DAYS.map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.week}>
                {week.map((day, di) => {
                  const isToday   = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                  const isSelected = day === selectedDay;
                  const hasRace    = day !== null && raceDays.has(day);
                  return (
                    <View key={di} style={styles.dayCell}>
                      {day ? (
                        <TouchableOpacity
                          style={[styles.dayBtn, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday]}
                          onPress={() => setSelectedDay(day)}>
                          <Text style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                            isToday && !isSelected && styles.dayTextToday,
                          ]}>
                            {day}
                          </Text>
                          {hasRace && <View style={[styles.raceDot, isSelected && styles.raceDotSelected]} />}
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.dayBtn} />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Selected day races */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ngày {selectedDay}/{viewMonth + 1} · {selectedRaces.length} cuộc đua
            </Text>

            {selectedRaces.length === 0 ? (
              <View style={styles.empty}>
                <Calendar size={36} color={C.onSurfaceVariant} style={{ opacity: 0.4 }} />
                <Text style={styles.emptyText}>Không có cuộc đua nào</Text>
              </View>
            ) : (
              selectedRaces.map((race, i) => (
                <Animated.View key={race.id} entering={FadeInDown.delay(i * 60).duration(280)}>
                  <View style={[styles.raceCard, race.status === 'live' && styles.raceCardLive]}>
                    <View style={styles.raceCardTop}>
                      <View style={styles.raceCardLeft}>
                        <View style={styles.raceStatusRow}>
                          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[race.status] }]} />
                          <Text style={[styles.raceStatus, { color: STATUS_COLOR[race.status] }]}>
                            {STATUS_LABEL[race.status]}
                          </Text>
                        </View>
                        <Text style={styles.raceName}>{race.name}</Text>
                        <View style={styles.raceMeta}>
                          <MapPin size={11} color={C.onSurfaceVariant} />
                          <Text style={styles.raceMetaText}>{race.location}</Text>
                          <Text style={styles.raceMetaDot}>·</Text>
                          <Text style={styles.raceMetaText}>{race.distance}m</Text>
                          <Text style={styles.raceMetaDot}>·</Text>
                          <Text style={[styles.raceMetaText, { color: C.secondary }]}>{formatCurrency(race.purse)}</Text>
                        </View>
                      </View>
                      <View style={styles.raceTimeBadge}>
                        <Text style={styles.raceTime}>{race.time}</Text>
                      </View>
                    </View>

                    {/* My horse entry */}
                    <View style={styles.myEntry}>
                      <Zap size={14} color={C.onPrimaryContainer} />
                      <View>
                        <Text style={styles.myHorse}>{race.myEntry.horse.name} · #{race.myEntry.horse.number}</Text>
                        <Text style={styles.myOdds}>Tỷ lệ cược: {race.myEntry.odds}x</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}
          </View>

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  // Calendar
  calCard:   { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, overflow: 'hidden' },
  monthNav:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.one, paddingBottom: Spacing.two },
  navBtn:    { width: 32, height: 32, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  monthTitle:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  dayHeaders:{ flexDirection: 'row', marginBottom: Spacing.one },
  dayHeader: { flex: 1, textAlign: 'center', color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 11 },
  week:      { flexDirection: 'row' },
  dayCell:   { flex: 1, alignItems: 'center', paddingVertical: 2 },
  dayBtn:    { width: 36, height: 36, borderRadius: Shape.full, justifyContent: 'center', alignItems: 'center' },
  daySelected:{ backgroundColor: C.primary },
  dayToday:  { backgroundColor: C.primaryContainer },
  dayText:   { color: C.onSurface, fontFamily: FontFamily.regular, fontSize: 13 },
  dayTextSelected: { color: C.onPrimary, fontFamily: FontFamily.bold },
  dayTextToday:    { color: C.primary, fontFamily: FontFamily.bold },
  raceDot:   { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: C.secondary },
  raceDotSelected: { backgroundColor: '#FFFFFF' },

  // Race list
  section:     { gap: Spacing.two },
  sectionTitle:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  empty:       { alignItems: 'center', paddingVertical: 40, gap: Spacing.two },
  emptyText:   { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 14 },
  raceCard:    { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two },
  raceCardLive:{ borderWidth: 1.5, borderColor: C.tertiary },
  raceCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  raceCardLeft:{ flex: 1, gap: 4 },
  raceStatusRow:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  raceStatus:  { fontFamily: FontFamily.medium, fontSize: 11 },
  raceName:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  raceMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  raceMetaText:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  raceMetaDot: { color: C.onSurfaceVariant, fontSize: 11 },
  raceTimeBadge:{ backgroundColor: C.primaryContainer, borderRadius: Shape.medium, paddingHorizontal: 10, paddingVertical: 5 },
  raceTime:    { color: C.primary, fontFamily: FontFamily.bold, fontSize: 13 },
  myEntry:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, backgroundColor: C.primaryContainer, borderRadius: Shape.medium, padding: Spacing.two },
  myHorse:     { color: C.onPrimaryContainer, fontFamily: FontFamily.bold, fontSize: 13 },
  myOdds:      { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 11 },
});
