import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CircleCheck, Circle, Target, Coins } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/mock-data';
import { useSpectatorPoints, useSpectatorRaces } from '@/hooks/useSpectatorData';
import { spectatorApi } from '@/api/spectator.api';
import { NumberWheelPicker } from '@/components/ui/number-wheel-picker';

type Props = { onSubmitted: () => void };

export function PredictForm({ onSubmitted }: Props) {
  const { races, loading } = useSpectatorRaces();
  const { balance, reload: reloadPoints } = useSpectatorPoints();
  const predictableRaces = races.filter(r => r.canPredict && !r.hasPrediction);
  const [selectedRaceId, setSelectedRaceId]   = useState<string | null>(null);
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [ticketCountInput, setTicketCountInput] = useState('1');
  const [submitted, setSubmitted]             = useState(false);
  const [submitting, setSubmitting]           = useState(false);

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

  const handleSubmit = async () => {
    if (!selectedRaceId || !selectedHorseId) return;
    if (ticketCount <= 0) {
      Alert.alert('Số phiếu không hợp lệ', 'Vui lòng nhập số phiếu lớn hơn 0.');
      return;
    }
    if (cost > balance) {
      Alert.alert('Không đủ điểm', `Bạn cần ${cost.toLocaleString('vi-VN')} điểm để gửi dự đoán này.`);
      return;
    }
    setSubmitting(true);
    try {
      await spectatorApi.createPrediction(selectedRaceId, [{ rank: 1, horseId: selectedHorseId }], ticketCount);
      reloadPoints();
      setSubmitted(true);
      setTimeout(onSubmitted, 1800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
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
          {cost > 0 ? `\n-${cost.toLocaleString()} điểm` : ''}
        </Text>
      </Animated.View>
    );
  }

  if (predictableRaces.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Target size={40} color={C.onSurfaceVariant} />
        <Text style={styles.emptyText}>Hiện không có cuộc đua nào đang mở dự đoán</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Step 1: Race selection */}
      <Text style={styles.stepLabel}>Bước 1 — Chọn cuộc đua</Text>
      <View style={styles.raceList}>
        {predictableRaces.map(race => {
          const isSelected = selectedRaceId === race.id;
          return (
            <TouchableOpacity
              key={race.id}
              style={[styles.raceItem, isSelected && styles.raceItemSelected]}
              onPress={() => handleSelectRace(race.id)}
              activeOpacity={0.8}>
              <View style={styles.raceItemLeft}>
                {isSelected
                  ? <CircleCheck size={20} color={C.primary} />
                  : <Circle size={20} color={C.onSurfaceVariant} />}
                <View style={styles.raceItemText}>
                  <Text style={[styles.raceItemName, isSelected && styles.raceItemNameSelected]} numberOfLines={1}>
                    {race.name}
                  </Text>
                  <Text style={styles.raceItemMeta}>
                    {formatDate(race.date)} · {race.time} · {formatCurrency(race.purse)}
                  </Text>
                </View>
              </View>
              {race.status === 'live' && (
                <View style={styles.livePill}>
                  <Text style={styles.livePillText}>LIVE</Text>
                </View>
              )}
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
                  <View style={[styles.horseColorCircle, { backgroundColor: entry.horse.color }]}>
                    <Text style={styles.horseNumber}>{entry.horse.number}</Text>
                  </View>
                  <View style={styles.horseInfo}>
                    <Text style={[styles.horseName, isSelected && styles.horseNameSelected]}>
                      {entry.horse.name}
                    </Text>
                    <Text style={styles.jockeyName}>{entry.jockeyName}</Text>
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
                Giá 1 phiếu: {ticketPrice.toLocaleString('vi-VN')} điểm
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
            <Text style={styles.submitText}>Gửi dự đoán · {cost.toLocaleString('vi-VN')} pts</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.three },

  stepLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12, letterSpacing: 0.5, marginBottom: Spacing.one },

  raceList:            { gap: Spacing.two },
  raceItem:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, borderWidth: 1, borderColor: 'transparent' },
  raceItemSelected:    { backgroundColor: C.primaryContainer, borderColor: C.primary },
  raceItemLeft:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  raceItemText:        { flex: 1 },
  raceItemName:        { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  raceItemNameSelected:{ color: C.onPrimaryContainer },
  raceItemMeta:        { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  livePill:            { backgroundColor: C.error, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 2 },
  livePillText:        { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 9, letterSpacing: 0.8 },

  horseList:        { gap: Spacing.two },
  horseItem:        { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, borderWidth: 1, borderColor: 'transparent' },
  horseItemSelected:{ backgroundColor: C.primaryContainer, borderColor: C.primary },
  horseColorCircle: { width: 36, height: 36, borderRadius: Shape.full, justifyContent: 'center', alignItems: 'center' },
  horseNumber:      { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 13 },
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
});
