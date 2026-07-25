import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { ArrowLeft, Wallet, Zap, CreditCard } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useSpectatorPoints, useSpectatorTopUps } from '@/hooks/useSpectatorData';
import { spectatorApi } from '@/api/spectator.api';
import { ApiError } from '@/api/client';
import { formatNumber } from '@/mock-data';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];
const MIN_POINTS = 100;
const VND_PER_POINT = 1000;

function statusLabel(C: AppColors): Record<string, { label: string; color: string }> {
  return {
    paid:      { label: 'Đã nạp',   color: C.tertiary },
    pending:   { label: 'Chờ thanh toán', color: C.secondary },
    failed:    { label: 'Thất bại', color: C.error },
    expired:   { label: 'Hết hạn',  color: C.onSurfaceVariant },
    cancelled: { label: 'Đã hủy',   color: C.onSurfaceVariant },
  };
}

export function TopUp() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const STATUS_LABEL = statusLabel(C);
  const { balance, reload: reloadPoints } = useSpectatorPoints();
  const { topUps, reload: reloadTopUps } = useSpectatorTopUps();
  const [points, setPoints] = useState('500');
  const [mockLoading, setMockLoading] = useState(false);
  const [payosLoading, setPayosLoading] = useState(false);

  const parsedPoints = parseInt(points, 10) || 0;
  const validPoints = Number.isInteger(parsedPoints) && parsedPoints >= MIN_POINTS;
  const cost = parsedPoints * VND_PER_POINT;

  const refreshAll = () => { reloadPoints(); reloadTopUps(); };

  const handleMockTopUp = async () => {
    if (!validPoints) return;
    setMockLoading(true);
    try {
      await spectatorApi.createTopUp(parsedPoints);
      Alert.alert('Thành công', `Đã nạp ${formatNumber(parsedPoints)} điểm vào tài khoản.`);
      refreshAll();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể nạp điểm, vui lòng thử lại.';
      Alert.alert('Nạp điểm thất bại', message);
    } finally {
      setMockLoading(false);
    }
  };

  const handlePayosTopUp = async () => {
    if (!validPoints) return;
    setPayosLoading(true);
    try {
      const res = await spectatorApi.createPayosTopUp(parsedPoints);
      await WebBrowser.openBrowserAsync(res.paymentUrl);
      Alert.alert(
        'Đang kiểm tra thanh toán',
        'Nếu bạn đã thanh toán thành công qua PayOS, số điểm sẽ được cập nhật trong giây lát.',
      );
      refreshAll();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể tạo phiên thanh toán PayOS.';
      Alert.alert('Không thể thanh toán', message);
    } finally {
      setPayosLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Nạp điểm"
          contentContainerStyle={styles.scroll}
          leftAction={
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color={C.onSurface} />
            </TouchableOpacity>
          }>

          {/* Current balance */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.balanceCard}>
            <Wallet size={22} color={C.primary} />
            <View style={styles.balanceTextWrap}>
              <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
              <Text style={styles.balanceValue}>{formatNumber(balance)} điểm</Text>
            </View>
          </Animated.View>

          {/* Amount picker */}
          <Animated.View entering={FadeInDown.delay(60).duration(300)} style={styles.form}>
            <Text style={styles.stepLabel}>Số điểm muốn nạp (tối thiểu {MIN_POINTS})</Text>
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.quickChip, points === String(a) && styles.quickChipSelected]}
                  onPress={() => setPoints(String(a))}
                  activeOpacity={0.8}>
                  <Text style={[styles.quickChipText, points === String(a) && styles.quickChipTextSelected]}>
                    {formatNumber(a)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              label="Số điểm"
              value={points}
              onChangeText={setPoints}
              mode="outlined"
              keyboardType="number-pad"
              left={<TextInput.Icon icon="star-outline" />}
            />
            <Text style={styles.costText}>
              Thành tiền: {formatNumber(cost)} VNĐ (1.000đ = 1 điểm)
            </Text>
            {!validPoints && (
              <Text style={styles.errorText}>Số điểm phải là số nguyên và tối thiểu {MIN_POINTS}</Text>
            )}
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(120).duration(300)} style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.payosBtn, (!validPoints || payosLoading) && styles.actionBtnDisabled]}
              onPress={handlePayosTopUp}
              disabled={!validPoints || payosLoading}
              activeOpacity={0.85}>
              {payosLoading ? <ActivityIndicator color={C.onPrimary} /> : (
                <>
                  <CreditCard size={18} color={C.onPrimary} />
                  <Text style={styles.payosBtnText}>Thanh toán qua PayOS</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.mockBtn, (!validPoints || mockLoading) && styles.actionBtnDisabled]}
              onPress={handleMockTopUp}
              disabled={!validPoints || mockLoading}
              activeOpacity={0.85}>
              {mockLoading ? <ActivityIndicator color={C.secondary} /> : (
                <>
                  <Zap size={18} color={C.secondary} />
                  <Text style={styles.mockBtnText}>Nạp thử (demo)</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Top-up history */}
          <Animated.View entering={FadeInDown.delay(180).duration(300)} style={styles.historySection}>
            <Text style={styles.sectionTitle}>Lịch sử nạp điểm</Text>
            {topUps.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có giao dịch nạp điểm nào</Text>
            ) : (
              topUps.map(tx => {
                const cfg = STATUS_LABEL[tx.status] ?? { label: tx.status, color: C.onSurfaceVariant };
                return (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={styles.txInfo}>
                      <Text style={styles.txPoints}>+{formatNumber(tx.points)} điểm</Text>
                      <Text style={styles.txMeta}>
                        {tx.provider === 'payos' ? 'PayOS' : 'Demo'} · {formatNumber(tx.amountVnd)} VNĐ
                      </Text>
                    </View>
                    <Text style={[styles.txStatus, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                );
              })
            )}
          </Animated.View>

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  backBtn: {
    width: 34, height: 34, borderRadius: Shape.full,
    backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center',
  },

  balanceCard:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three },
  balanceTextWrap:{ flex: 1 },
  balanceLabel:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  balanceValue:   { color: C.primary, fontFamily: FontFamily.bold, fontSize: 20 },

  form:      { gap: Spacing.two },
  stepLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12, letterSpacing: 0.5 },

  quickRow:            { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  quickChip:           { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Shape.full, backgroundColor: SC.high, borderWidth: 1, borderColor: 'transparent' },
  quickChipSelected:   { backgroundColor: C.primaryContainer, borderColor: C.primary },
  quickChipText:       { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 13 },
  quickChipTextSelected:{ color: C.onPrimaryContainer },

  costText:  { color: C.secondary, fontFamily: FontFamily.medium, fontSize: 13 },
  errorText: { color: C.error, fontFamily: FontFamily.regular, fontSize: 12 },

  actions:  { gap: Spacing.two },
  actionBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Shape.full, paddingVertical: 14 },
  actionBtnDisabled: { opacity: 0.5 },
  payosBtn:     { backgroundColor: C.primary },
  payosBtnText: { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 15 },
  mockBtn:      { borderWidth: 1, borderColor: C.secondary },
  mockBtnText:  { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 15 },

  historySection: { gap: Spacing.two },
  sectionTitle:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  emptyText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, textAlign: 'center', paddingVertical: Spacing.three },

  txRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: SC.high, borderRadius: Shape.medium, padding: Spacing.two, marginBottom: Spacing.one },
  txInfo:   { gap: 2 },
  txPoints: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  txMeta:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  txStatus: { fontFamily: FontFamily.bold, fontSize: 12 },
  });
}
