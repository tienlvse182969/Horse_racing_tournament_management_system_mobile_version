import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, TextInput, Modal, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { CircleCheck, Circle, Target, Coins, X, Calendar, Clock } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { formatCurrency, formatDate, formatNumber } from '@/mock-data';
import { useSpectatorPoints, useSpectatorRaces } from '@/hooks/useSpectatorData';
import { spectatorApi } from '@/api/spectator.api';
import { NumberWheelPicker } from '@/components/ui/number-wheel-picker';

const HORSE_AVATAR = require('@/assets/images/a-horse-with-long-hair-and-a-white-mane-free-photo.jpeg');

type Props = { onSubmitted: () => void };

export function PredictForm({ onSubmitted }: Props) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { races, loading } = useSpectatorRaces();
  const { balance, reload: reloadPoints } = useSpectatorPoints();
  const predictableRaces = races.filter(r => r.canPredict && !r.hasPrediction);
  const [selectedRaceId, setSelectedRaceId]   = useState<string | null>(null);
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [ticketCountInput, setTicketCountInput] = useState('1');
  const [submitted, setSubmitted]             = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [confirmVisible, setConfirmVisible]   = useState(false);

  const selectedRace  = predictableRaces.find(r => r.id === selectedRaceId);
  const selectedHorse = selectedRace?.entries.find(e => e.horse.id === selectedHorseId);
  const ticketPrice = selectedRace?.predictionConfig?.poolEnabled ? selectedRace.predictionConfig.ticketPrice : 0;
  const ticketCount = Math.max(0, parseInt(ticketCountInput, 10) || 0);
  const cost = ticketPrice * ticketCount;

  const handleSelectRace = (id: string) => {
    setSelectedRaceId(id);
    setSelectedHorseId(null);
    setTicketCountInput('1');
  };

  const handleSubmit = () => {
    if (!selectedRaceId || !selectedHorseId) return;
    if (ticketCount <= 0) {
      Alert.alert('Số phiếu không hợp lệ', 'Vui lòng nhập số phiếu lớn hơn 0.');
      return;
    }
    if (cost > balance) {
      Alert.alert('Không đủ điểm', `Bạn cần ${formatNumber(cost)} điểm để gửi dự đoán này.`);
      return;
    }
    setConfirmVisible(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedRaceId || !selectedHorseId) return;
    setSubmitting(true);
    try {
      await spectatorApi.createPrediction(selectedRaceId, [{ rank: 1, horseId: selectedHorseId }], ticketCount);
      reloadPoints();
      setConfirmVisible(false);
      setSubmitted(true);
      setTimeout(onSubmitted, 1800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      setConfirmVisible(false);
      Alert.alert('Không thể gửi dự đoán', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator color={C.primary} style={{ marginTop: Spacing.three }} />;
  }

  if (submitted) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.successBox}>
        <View style={styles.successIcon}>
          <CircleCheck size={56} color={C.tertiary} />
        </View>
        <Text style={styles.successTitle}>Đã gửi dự đoán!</Text>
        <Text style={styles.successSub}>
          #{selectedHorse?.horse.number} {selectedHorse?.horse.name}{'\n'}
          {selectedRace?.name}
          {cost > 0 ? `\n-${formatNumber(cost)} điểm` : ''}
        </Text>
      </Animated.View>
    );
  }

  if (predictableRaces.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Target size={40} color={C.onSurfaceVariant} />
        <Text style={styles.emptyText}>Hiện không có trận đấu nào đang mở dự đoán</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Step 1: Race selection */}
      <Text style={styles.stepLabel}>Bước 1 — Chọn trận đấu</Text>
      <View style={styles.raceList}>
        {predictableRaces.map(race => {
          const isSelected = selectedRaceId === race.id;
          const isLive = race.status === 'live';
          return (
            <TouchableOpacity
              key={race.id}
              style={[styles.raceItem, isSelected && styles.raceItemSelected]}
              onPress={() => handleSelectRace(race.id)}
              activeOpacity={0.85}>
              <View style={styles.raceItemHeader}>
                <View style={[styles.raceBadge, isLive ? styles.raceBadgeLive : styles.raceBadgeUpcoming]}>
                  <Text style={[styles.raceBadgeText, isLive ? styles.raceBadgeTextLive : styles.raceBadgeTextUpcoming]}>
                    {isLive ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA'}
                  </Text>
                </View>
                {isSelected
                  ? <CircleCheck size={20} color={C.primary} />
                  : <Circle size={20} color={C.onSurfaceVariant} />}
              </View>
              <Text style={[styles.raceItemName, isSelected && styles.raceItemNameSelected]} numberOfLines={1}>
                {race.name}
              </Text>
              <View style={styles.raceMetaRow}>
                <RaceMetaChip Icon={Calendar} text={formatDate(race.date)} />
                <RaceMetaChip Icon={Clock} text={race.time} />
                <RaceMetaChip Icon={Coins} text={`${formatNumber(race.purse)} điểm`} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Step 2: Horse selection */}
      {selectedRace && (
        <Animated.View entering={FadeInDown.duration(280)}>
          <Text style={styles.stepLabel}>Bước 2 — Chọn ngựa thắng</Text>
          <View style={styles.horseList}>
            {selectedRace.entries.map(entry => {
              const isSelected = selectedHorseId === entry.horse.id;
              return (
                <TouchableOpacity
                  key={entry.horse.id}
                  style={[styles.horseItem, isSelected && styles.horseItemSelected]}
                  onPress={() => setSelectedHorseId(entry.horse.id)}
                  activeOpacity={0.8}>
                  <View style={[styles.horseAvatar, { borderColor: entry.horse.color }]}>
                    <Image source={HORSE_AVATAR} style={styles.horseAvatarImg} contentFit="cover" />
                  </View>
                  <View style={styles.horseInfo}>
                    <Text style={[styles.horseName, isSelected && styles.horseNameSelected]}>
                      {entry.horse.name}
                    </Text>
                    {!!entry.jockeyName && <Text style={styles.jockeyName}>{entry.jockeyName}</Text>}
                  </View>
                  <View style={styles.oddsBadge}>
                    <Text style={styles.oddsText}>Đang có {entry.ticketCount ?? 0} phiếu</Text>
                  </View>
                  {isSelected && (
                    <CircleCheck size={20} color={C.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      )}

      {selectedRace && (
        <Animated.View entering={FadeInDown.duration(280)}>
          <Text style={styles.stepLabel}>Bước 3 — Số phiếu đặt vào</Text>
          <View style={styles.ticketRow}>
            <NumberWheelPicker
              min={1}
              max={20}
              value={Math.max(1, Math.min(20, ticketCount || 1))}
              onChange={(n) => setTicketCountInput(String(n))}
            />
            <View style={styles.ticketSide}>
              <TextInput
                style={styles.ticketInput}
                keyboardType="number-pad"
                value={ticketCountInput}
                onChangeText={setTicketCountInput}
                placeholder="Số phiếu"
                placeholderTextColor={C.onSurfaceVariant}
              />
              <Text style={styles.ticketPriceText}>
                Giá 1 phiếu: {formatNumber(ticketPrice)} điểm
              </Text>
            </View>
          </View>
          {ticketCount <= 0 && (
            <Text style={styles.hintText}>Nhập số phiếu lớn hơn 0</Text>
          )}
          {ticketCount > 0 && cost > balance && (
            <Text style={styles.insufficientText}>Không đủ điểm cho {ticketCount} phiếu này</Text>
          )}
        </Animated.View>
      )}

      {/* Submit */}
      {selectedRaceId && selectedHorseId && (
        <Animated.View entering={FadeIn.duration(250)}>
          <TouchableOpacity
            style={[styles.submitBtn, (ticketCount <= 0 || cost > balance) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}>
            <Target size={18} color={C.onSecondary} />
            <Text style={styles.submitText}>Gửi dự đoán · {formatNumber(cost)} pts</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { if (!submitting) setConfirmVisible(false); }}>
        <Pressable style={styles.modalBackdrop} onPress={() => { if (!submitting) setConfirmVisible(false); }}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {!submitting && (
              <Pressable style={styles.modalCloseBtn} onPress={() => setConfirmVisible(false)}>
                <X size={20} color={C.onSurfaceVariant} />
              </Pressable>
            )}
            <Text style={styles.modalTitle}>Xác nhận dự đoán</Text>
            <Text style={styles.modalSub}>Vui lòng kiểm tra lại thông tin trước khi gửi</Text>

            <View style={styles.modalInfoBox}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Trận đấu</Text>
                <Text style={styles.modalInfoValue} numberOfLines={1}>{selectedRace?.name}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Ngựa dự đoán</Text>
                <Text style={styles.modalInfoValue} numberOfLines={1}>
                  #{selectedHorse?.horse.number} {selectedHorse?.horse.name}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Số phiếu</Text>
                <Text style={styles.modalInfoValue}>{ticketCount}</Text>
              </View>
              <View style={[styles.modalInfoRow, styles.modalInfoRowLast]}>
                <Text style={styles.modalInfoLabel}>Tổng điểm cược</Text>
                <Text style={styles.modalInfoValueStrong}>{formatNumber(cost)} pts</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                disabled={submitting}
                onPress={() => setConfirmVisible(false)}
                activeOpacity={0.8}>
                <Text style={styles.modalBtnGhostText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm, submitting && styles.submitBtnDisabled]}
                disabled={submitting}
                onPress={handleConfirmSubmit}
                activeOpacity={0.85}>
                {submitting
                  ? <ActivityIndicator color={C.onSecondary} />
                  : <Text style={styles.modalBtnConfirmText}>Xác nhận gửi</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function RaceMetaChip({ Icon, text }: { Icon: React.ComponentType<{ size?: number; color?: string }>; text: string }) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.raceMetaChip}>
      <Icon size={11} color={C.onSurfaceVariant} />
      <Text style={styles.raceMetaChipText}>{text}</Text>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root: { gap: Spacing.three },

  stepLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12, letterSpacing: 0.5, marginBottom: Spacing.one },

  raceList:            { gap: Spacing.two },
  raceItem:            { backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: Spacing.two, borderWidth: 1, borderColor: 'transparent' },
  raceItemSelected:    { backgroundColor: C.primaryContainer, borderColor: C.primary },
  raceItemHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  raceBadge:           { borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 3 },
  raceBadgeLive:       { backgroundColor: C.error },
  raceBadgeUpcoming:   { backgroundColor: `${C.secondary}30` },
  raceBadgeText:       { fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  raceBadgeTextLive:   { color: '#FFFFFF' },
  raceBadgeTextUpcoming:{ color: C.secondary },
  raceItemName:        { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 16 },
  raceItemNameSelected:{ color: C.onPrimaryContainer },
  raceMetaRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  raceMetaChip:        { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${C.onSurfaceVariant}15`, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 3 },
  raceMetaChipText:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },

  horseList:        { gap: Spacing.two },
  horseItem:        { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, borderWidth: 1, borderColor: 'transparent' },
  horseItemSelected:{ backgroundColor: C.primaryContainer, borderColor: C.primary },
  horseColorCircle: { width: 36, height: 36, borderRadius: Shape.full, justifyContent: 'center', alignItems: 'center' },
  horseNumber:      { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  horseAvatar:      { width: 36, height: 36, borderRadius: Shape.full, borderWidth: 2, overflow: 'hidden' },
  horseAvatarImg:   { width: '100%', height: '100%' },
  horseInfo:        { flex: 1 },
  horseName:        { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  horseNameSelected:{ color: C.onPrimaryContainer },
  jockeyName:       { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  oddsBadge:        { backgroundColor: SC.highest, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 3 },
  oddsText:         { color: C.primary, fontFamily: FontFamily.bold, fontSize: 12 },

  submitBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, backgroundColor: C.secondary, borderRadius: Shape.full, paddingVertical: 14, marginTop: Spacing.one },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: C.onSecondary, fontFamily: FontFamily.bold, fontSize: 16 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  ticketSide: { flex: 1, gap: Spacing.two },
  ticketInput: { backgroundColor: SC.high, borderRadius: Shape.large, paddingHorizontal: 14, paddingVertical: 10, color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, borderWidth: 1, borderColor: 'transparent' },
  ticketPriceText: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12 },
  hintText: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12, marginTop: Spacing.one },
  insufficientText: { color: C.error, fontFamily: FontFamily.medium, fontSize: 12, marginTop: Spacing.one },

  successBox:   { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six },
  successIcon:  { marginBottom: Spacing.two },
  successTitle: { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 22 },
  successSub:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  emptyBox:  { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six },
  emptyText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14, textAlign: 'center' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
  modalCard:     { width: '100%', maxWidth: 360, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: 4 },
  modalCloseBtn: { position: 'absolute', top: Spacing.two, right: Spacing.two, width: 32, height: 32, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  modalTitle:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 17, paddingRight: Spacing.five },
  modalSub:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, marginBottom: Spacing.two },

  modalInfoBox:      { backgroundColor: SC.base, borderRadius: Shape.medium, padding: Spacing.two, gap: Spacing.one },
  modalInfoRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two, paddingBottom: Spacing.one, borderBottomWidth: 1, borderBottomColor: `${C.onSurfaceVariant}20` },
  modalInfoRowLast:  { paddingBottom: 0, borderBottomWidth: 0 },
  modalInfoLabel:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  modalInfoValue:    { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, flexShrink: 1, textAlign: 'right' },
  modalInfoValueStrong: { color: C.primary, fontFamily: FontFamily.bold, fontSize: 15 },

  modalActions:      { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  modalBtn:          { flex: 1, borderRadius: Shape.full, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  modalBtnGhost:     { backgroundColor: SC.highest },
  modalBtnGhostText: { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 14 },
  modalBtnConfirm:      { backgroundColor: C.secondary },
  modalBtnConfirmText:  { color: C.onSecondary, fontFamily: FontFamily.bold, fontSize: 14 },
  });
}
