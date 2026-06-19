import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Trophy, ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { AvatarTabButton } from '@/components/avatar-tab-button';
import { useSpectatorPoints } from '@/hooks/useSpectatorData';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

const TX_LABEL: Record<string, string> = {
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

export function SpectatorRewardsHistory() {
  const { balance, transactions } = useSpectatorPoints();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Lịch sử thưởng"
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

          {/* Balance banner */}
          <Animated.View entering={FadeIn.duration(400)}>
            <LinearGradient
              colors={['#3D2800', '#8B5E00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.banner}>
              <View style={styles.bannerIconWrap}>
                <Trophy size={28} color={C.primary} />
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerLabel}>Số dư hiện tại</Text>
                <Text style={styles.bannerBalance}>
                  {balance.toLocaleString('vi-VN')} <Text style={styles.bannerUnit}>điểm</Text>
                </Text>
                <Text style={styles.bannerSub}>
                  {transactions.length} giao dịch thưởng gần nhất
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* List */}
          <Text style={styles.sectionTitle}>Chi tiết thưởng</Text>

          {transactions.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyWrap}>
              <Gift size={36} color={C.onSurfaceVariant} />
              <Text style={styles.emptyText}>Chưa có lịch sử thưởng</Text>
            </Animated.View>
          ) : (
            transactions.map((tx, i) => (
              <Animated.View key={tx.id} entering={FadeInDown.delay(i * 40).duration(280)}>
                <View style={styles.card}>
                  <View style={styles.iconWrap}>
                    <Gift size={20} color={C.primary} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {tx.note ?? TX_LABEL[tx.type] ?? tx.type}
                      </Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>Đã nhận</Text>
                      </View>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardTime}>{timeAgo(tx.createdAt)}</Text>
                      <Text style={styles.cardAmount}>+{tx.points.toLocaleString('vi-VN')} pts</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))
          )}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },

  banner:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: Shape.large, padding: Spacing.three },
  bannerIconWrap:{ width: 48, height: 48, borderRadius: Shape.full, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  bannerText:    { flex: 1 },
  bannerLabel:   { color: 'rgba(255,255,255,0.6)', fontFamily: FontFamily.regular, fontSize: 11 },
  bannerBalance: { color: C.primary, fontFamily: FontFamily.bold, fontSize: 26, lineHeight: 32 },
  bannerUnit:    { fontSize: 14, fontFamily: FontFamily.regular },
  bannerSub:     { color: 'rgba(255,255,255,0.5)', fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },

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
});
