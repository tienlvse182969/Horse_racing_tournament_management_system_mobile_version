import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Wallet, PiggyBank, ChevronLeft, Plus, X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { AvatarTabButton } from '@/components/avatar-tab-button';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useSpectatorPoints } from '@/hooks/useSpectatorData';
import { spectatorApi } from '@/api/spectator.api';
import { formatNumber } from '@/mock-data';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

const TX_LABEL: Record<string, string> = {
  topup:                   'Nạp điểm',
  earned_prediction:       'Thưởng dự đoán',
  earned_bonus:            'Thưởng thêm',
  earned_pool_share:       'Chia thưởng pool',
  refunded_pool:           'Hoàn pool dự đoán',
  refunded_redemption:     'Hoàn đổi thưởng',
  refunded_viewing_ticket: 'Hoàn vé xem',
  spent_pool_entry:        'Tham gia pool',
  spent_redemption:        'Đổi thưởng',
  spent_viewing_ticket:    'Mua vé xem',
};

function txStatus(points: number): { label: string; tone: 'credit' | 'debit' | 'neutral' } {
  if (points > 0) return { label: 'Đã nhận', tone: 'credit' };
  if (points < 0) return { label: 'Đã trừ', tone: 'debit' };
  return { label: 'Đã ghi nhận', tone: 'neutral' };
}

export function SpectatorRewardsHistory() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { balance, totalEarned, totalSpent, transactions, reload } = useSpectatorPoints();
  const [topUpPoints, setTopUpPoints] = useState('100000');
  const [submitting, setSubmitting] = useState(false);
  const [topUpVisible, setTopUpVisible] = useState(false);

  const parseTopUpPoints = () => {
    const points = Number(topUpPoints);
    if (!Number.isInteger(points) || points < 100) {
      Alert.alert('Không thể nạp điểm', 'Mỗi lần nạp tối thiểu 100 điểm.');
      return null;
    }
    return points;
  };

  const submitMockTopUp = async () => {
    const points = parseTopUpPoints();
    if (!points) return;
    setSubmitting(true);
    try {
      await spectatorApi.topUpPoints(points);
      reload();
      setTopUpVisible(false);
      Alert.alert('Nạp điểm thành công', `Đã nạp ${formatNumber(points)} điểm.`);
    } catch (error) {
      Alert.alert('Không thể nạp điểm', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitPayosTopUp = async () => {
    const points = parseTopUpPoints();
    if (!points) return;
    setSubmitting(true);
    try {
      const res = await spectatorApi.createPayosTopUp(points);
      setTopUpVisible(false);
      await Linking.openURL(res.paymentUrl);
    } catch (error) {
      Alert.alert('Không thể tạo thanh toán', error instanceof Error ? error.message : 'Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Ví điểm của bạn"
          contentContainerStyle={styles.scroll}
          leftAction={
            <Pressable
              style={styles.backBtn}
              onPress={() => router.back()}
              android_ripple={{ color: '#ffffff22', radius: 20, borderless: true }}>
              <ChevronLeft size={24} color={C.onSurface} />
            </Pressable>
          }
          rightAction={<AvatarTabButton />}>

          {/* Points overview */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.statsRow}>
            <View style={styles.statCard}>
              <Wallet size={20} color={C.primary} />
              <Text style={styles.statValue}>{formatNumber(balance)}</Text>
              <Text style={styles.statLabel}>Số dư hiện tại</Text>
            </View>
            <View style={styles.statCard}>
              <Gift size={20} color={C.tertiary} />
              <Text style={[styles.statValue, { color: C.tertiary }]}>{formatNumber(totalEarned)}</Text>
              <Text style={styles.statLabel}>Tổng đã nhận</Text>
            </View>
            <View style={styles.statCard}>
              <PiggyBank size={20} color={C.secondary} />
              <Text style={[styles.statValue, { color: C.secondary }]}>{formatNumber(totalSpent)}</Text>
              <Text style={styles.statLabel}>Tổng đã tiêu</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(320)}>
            <Pressable style={styles.topUpTrigger} onPress={() => setTopUpVisible(true)}>
              <Plus size={18} color={C.onPrimary} />
              <Text style={styles.topUpTriggerText}>Nạp thêm điểm thưởng</Text>
            </Pressable>
          </Animated.View>

          {/* List */}
          <Text style={styles.sectionTitle}>Lịch sử điểm</Text>

          {transactions.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyWrap}>
              <Gift size={36} color={C.onSurfaceVariant} />
              <Text style={styles.emptyText}>Chưa có lịch sử điểm</Text>
            </Animated.View>
          ) : (
            transactions.map((tx, i) => {
              const status = txStatus(tx.points);
              const isDebit = status.tone === 'debit';
              const Icon = isDebit ? ArrowDownCircle : ArrowUpCircle;
              const amountColor = isDebit ? C.error : C.primary;
              return (
              <Animated.View key={tx.id} entering={FadeInDown.delay(i * 40).duration(280)}>
                <View style={styles.card}>
                  <View style={[styles.iconWrap, { backgroundColor: isDebit ? C.errorContainer : C.primaryContainer }]}>
                    <Icon size={20} color={amountColor} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {tx.note ?? TX_LABEL[tx.type] ?? tx.type}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: isDebit ? C.errorContainer : C.tertiaryContainer }]}>
                        <Text style={[styles.statusBadgeText, { color: isDebit ? C.error : C.onTertiaryContainer }]}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardTime}>{timeAgo(tx.createdAt)}</Text>
                      <Text style={[styles.cardAmount, { color: amountColor }]}>
                        {tx.points > 0 ? '+' : ''}{formatNumber(tx.points)} pts
                      </Text>
                    </View>
                    <Text style={styles.balanceAfter}>
                      Số dư sau giao dịch: {formatNumber(tx.balanceAfter)} pts
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
            })
          )}

        </LargeHeaderScrollView>
      </SafeAreaView>

      <Modal
        visible={topUpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTopUpVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTopUpVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Pressable style={styles.modalCloseBtn} onPress={() => setTopUpVisible(false)}>
              <X size={20} color={C.onSurfaceVariant} />
            </Pressable>
            <Text style={styles.topUpTitle}>Nạp thêm điểm thưởng</Text>
            <Text style={styles.topUpSub}>1000 VND = 100000 điểm · tối thiểu 100 điểm</Text>
            <TextInput
              style={styles.topUpInput}
              keyboardType="number-pad"
              value={topUpPoints}
              editable={!submitting}
              onChangeText={setTopUpPoints}
              placeholder="100000"
              placeholderTextColor={C.onSurfaceVariant}
            />
            <View style={styles.topUpActions}>
              <Pressable style={styles.topUpBtn} disabled={submitting} onPress={submitMockTopUp}>
                <Text style={styles.topUpBtnText}>{submitting ? 'Đang xử lý...' : 'Top up demo'}</Text>
              </Pressable>
              <Pressable style={[styles.topUpBtn, styles.topUpBtnGhost]} disabled={submitting} onPress={submitPayosTopUp}>
                <Text style={styles.topUpBtnText}>Nạp điểm thưởng</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },

  statsRow:  { flexDirection: 'row', gap: Spacing.two },
  statCard:  { flex: 1, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: 4, alignItems: 'flex-start' },
  statValue: { color: C.primary, fontFamily: FontFamily.bold, fontSize: 16 },
  statLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, lineHeight: 14 },

  backBtn:      { width: 34, height: 34, borderRadius: Shape.full, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, marginTop: Spacing.one },

  emptyWrap: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five },
  emptyText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14 },

  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, marginBottom: Spacing.two, gap: Spacing.two },
  iconWrap:    { width: 40, height: 40, borderRadius: Shape.medium, backgroundColor: C.primaryContainer, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  cardContent: { flex: 1, gap: 4 },
  cardTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.one },
  cardTitle:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13, flex: 1 },
  statusBadge: { backgroundColor: C.tertiaryContainer, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 2 },
  statusBadgeText: { color: C.onTertiaryContainer, fontFamily: FontFamily.medium, fontSize: 10 },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTime:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  cardAmount:  { color: C.primary, fontFamily: FontFamily.bold, fontSize: 13 },
  balanceAfter:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },

  topUpTrigger: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.one, backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 13 },
  topUpTriggerText: { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 14 },

  topUpTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  topUpSub: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  topUpInput: { color: C.onSurface, borderWidth: 1, borderColor: C.outlineVariant, borderRadius: Shape.medium, paddingHorizontal: 12, paddingVertical: 10, fontFamily: FontFamily.medium, marginTop: Spacing.two },
  topUpActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  topUpBtn: { flex: 1, backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 11, alignItems: 'center' },
  topUpBtnGhost: { backgroundColor: C.secondary },
  topUpBtnText: { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 13 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
  modalCard:     { width: '100%', maxWidth: 360, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, gap: 4 },
  modalCloseBtn: { position: 'absolute', top: Spacing.two, right: Spacing.two, width: 32, height: 32, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  });
}
