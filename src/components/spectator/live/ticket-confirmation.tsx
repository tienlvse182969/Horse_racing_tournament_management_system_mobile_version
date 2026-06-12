import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, BellRing, CalendarDays, CheckCircle, Share2 } from 'lucide-react-native';

import { FontFamily, HorseRacingDark as C, Shape, Spacing, SurfaceContainers as SC } from '@/constants/theme';
import type { Race } from '@/mock-data';
import { formatDate } from '@/mock-data';

type Props = { race: Race; onBack: () => void; onWatch: () => void };
type TimeLeft = { h: number; m: number; s: number } | null;

function useCountdown(date: string, time: string): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const diff = new Date(`${date}T${time}:00`).getTime() - Date.now();
    return diff <= 0 ? null : { h: Math.floor(diff / 3_600_000), m: Math.floor((diff % 3_600_000) / 60_000), s: Math.floor((diff % 60_000) / 1_000) };
  });

  useEffect(() => {
    const id = setInterval(() => {
      const diff = new Date(`${date}T${time}:00`).getTime() - Date.now();
      setTimeLeft(diff <= 0 ? null : { h: Math.floor(diff / 3_600_000), m: Math.floor((diff % 3_600_000) / 60_000), s: Math.floor((diff % 60_000) / 1_000) });
    }, 1_000);
    return () => clearInterval(id);
  }, [date, time]);

  return timeLeft;
}

export function TicketConfirmation({ race, onBack, onWatch }: Props) {
  const insets = useSafeAreaInsets();
  const timeLeft = useCountdown(race.date, race.time);
  const isStarted = timeLeft === null;
  const ticketCode = `HR-${String(race.number).padStart(2, '0')}${race.date.slice(5).replace('-', '')}-${race.id.slice(-3).toUpperCase()}`;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vé của bạn</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success indicator */}
        <Animated.View entering={FadeInDown.duration(350)} style={styles.successBlock}>
          <CheckCircle size={56} color={C.tertiary} />
          <Text style={styles.successTitle}>Mua vé thành công!</Text>
          <Text style={styles.successSub}>Vé đã được lưu · Chúc bạn xem đua vui!</Text>
        </Animated.View>

        {/* Ticket card */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.ticket}>
          <Text style={styles.ticketBadge}>VÉ XEM ĐUA NGỰA</Text>
          <Text style={styles.ticketName}>{race.name}</Text>
          <View style={styles.infoGrid}>
            <TicketCell label="Ngày" value={formatDate(race.date)} />
            <TicketCell label="Giờ" value={race.time} />
            <TicketCell label="Địa điểm" value={race.location} />
            <TicketCell label="Khoảng cách" value={`${race.distance}m`} />
          </View>

          {/* Tear line */}
          <View style={styles.tearWrap}>
            <View style={styles.notch} />
            <View style={styles.tearDash} />
            <View style={styles.notch} />
          </View>

          <View style={styles.codeRow}>
            <View>
              <Text style={styles.ticketCellLabel}>Mã vé</Text>
              <Text style={styles.codeValue}>#{ticketCode}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.ticketCellLabel}>Loại vé</Text>
              <Text style={styles.codeValue}>1 người · Trực tuyến</Text>
            </View>
          </View>
        </Animated.View>

        {/* Countdown */}
        {!isStarted && timeLeft && (
          <Animated.View entering={FadeInDown.delay(160).duration(350)} style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>Cuộc đua bắt đầu sau</Text>
            <View style={styles.countdownRow}>
              <CountUnit value={timeLeft.h} unit="giờ" />
              <Text style={styles.countdownSep}>:</Text>
              <CountUnit value={timeLeft.m} unit="phút" />
              <Text style={styles.countdownSep}>:</Text>
              <CountUnit value={timeLeft.s} unit="giây" />
            </View>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(240).duration(350)} style={styles.actions}>
          <TouchableOpacity
            style={[styles.watchBtn, !isStarted && styles.watchBtnDisabled]}
            onPress={isStarted ? onWatch : undefined}
            activeOpacity={isStarted ? 0.75 : 1}>
            <Text style={[styles.watchBtnText, !isStarted && styles.watchBtnTextDisabled]}>
              {isStarted ? 'Xem trực tiếp ngay' : 'Sẽ mở khi cuộc đua bắt đầu'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Alert.alert('Nhắc nhở đã đặt', `Chúng tôi sẽ thông báo cho bạn 15 phút trước khi ${race.name} bắt đầu.`)}>
            <BellRing size={16} color={C.primary} />
            <Text style={styles.secondaryBtnText}>Nhắc tôi trước 15 phút</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Alert.alert('Thêm vào lịch', 'Tính năng thêm vào lịch sẽ sớm ra mắt.')}>
            <CalendarDays size={16} color={C.primary} />
            <Text style={styles.secondaryBtnText}>Thêm vào lịch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Alert.alert('Chia sẻ vé', `Mã vé của bạn: #${ticketCode}\nCuộc đua: ${race.name}\nNgày: ${formatDate(race.date)} lúc ${race.time}`)}>
            <Share2 size={16} color={C.primary} />
            <Text style={styles.secondaryBtnText}>Chia sẻ vé</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

function CountUnit({ value, unit }: { value: number; unit: string }) {
  return (
    <View style={styles.countUnit}>
      <Text style={styles.countNum}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.countUnitLabel}>{unit}</Text>
    </View>
  );
}

function TicketCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.ticketCell}>
      <Text style={styles.ticketCellLabel}>{label}</Text>
      <Text style={styles.ticketCellValue}>{value}</Text>
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

  // Success
  successBlock: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  successTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 20 },
  successSub:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },

  // Ticket card
  ticket:         { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two },
  ticketBadge:    { color: C.primary, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.5 },
  ticketName:     { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 18 },
  infoGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  ticketCell:     { width: '46%' },
  ticketCellLabel:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },
  ticketCellValue:{ color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, marginTop: 1 },

  // Tear line — notches sit outside the card's padding to create cut-out effect
  tearWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: -Spacing.three, marginVertical: Spacing.one,
  },
  notch:    { width: 14, height: 14, borderRadius: 7, backgroundColor: SC.lowest },
  tearDash: { flex: 1, height: 1, backgroundColor: C.outlineVariant, opacity: 0.4 },

  // Code section
  codeRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  codeValue:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13, marginTop: 1 },

  // Countdown
  countdownCard:  { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: Spacing.two },
  countdownLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },
  countdownRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  countUnit:      { alignItems: 'center', minWidth: 52 },
  countNum:       { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 38 },
  countUnitLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  countdownSep:   { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 28, marginBottom: 12 },

  // Actions
  actions:  { gap: Spacing.two },
  watchBtn: { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  watchBtnDisabled:     { backgroundColor: SC.high },
  watchBtnText:         { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 14 },
  watchBtnTextDisabled: { color: C.onSurfaceVariant },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    backgroundColor: SC.high, borderRadius: Shape.full,
    paddingVertical: 12, paddingHorizontal: Spacing.three,
  },
  secondaryBtnText: { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 14 },
});
