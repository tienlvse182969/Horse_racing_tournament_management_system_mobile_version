import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Flag, Target, Trophy, Bell } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { AvatarTabButton } from '@/components/avatar-tab-button';
import type { Notification, NotificationType } from '@/mock-data';
import { formatCurrency } from '@/mock-data';
import { useSpectatorNotifications } from '@/hooks/useSpectatorData';

type NotifIconComp = React.ComponentType<{ size?: number; color?: string }>;

const TYPE_CONFIG: Record<NotificationType, { Icon: NotifIconComp; color: string; bg: string }> = {
  reward:     { Icon: Gift,   color: C.primary,         bg: C.primaryContainer },
  result:     { Icon: Flag,   color: C.tertiary,        bg: C.tertiaryContainer },
  prediction: { Icon: Target, color: C.secondary,       bg: C.secondaryContainer },
  tournament: { Icon: Trophy, color: C.primary,         bg: C.primaryContainer },
  system:     { Icon: Bell,   color: C.onSurfaceVariant, bg: `${C.onSurfaceVariant}25` },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function SpectatorNotifications() {
  const { notifications: items, setNotifications } = useSpectatorNotifications();
  const unread = items.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Thông báo" contentContainerStyle={styles.scroll} rightAction={<AvatarTabButton />}>

          {/* Header row */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {unread > 0 ? `${unread} chưa đọc` : 'Tất cả đã đọc'}
            </Text>
            {unread > 0 && (
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.markAllText}>Đọc tất cả</Text>
              </TouchableOpacity>
            )}
          </View>

          {items.map((notif, i) => {
            const cfg = TYPE_CONFIG[notif.type];
            return (
              <Animated.View key={notif.id} entering={FadeInDown.delay(i * 40).duration(280)}>
                <TouchableOpacity
                  style={[styles.card, !notif.read && styles.cardUnread]}
                  onPress={() => markRead(notif.id)}
                  activeOpacity={0.85}>
                  {!notif.read && <View style={styles.unreadDot} />}
                  <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                    <cfg.Icon size={20} color={cfg.color} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{notif.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.typeBadgeText, { color: cfg.color }]}>
                          {notif.type === 'reward' ? 'Thưởng' :
                           notif.type === 'result' ? 'Kết quả' :
                           notif.type === 'prediction' ? 'Dự đoán' :
                           notif.type === 'tournament' ? 'Giải đấu' : 'Hệ thống'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardBody} numberOfLines={2}>{notif.body}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardTime}>{timeAgo(notif.time)}</Text>
                      {notif.reward && (
                        <Text style={styles.cardReward}>+{formatCurrency(notif.reward)}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },

  rewardBanner:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: Shape.large, padding: Spacing.three },
  rewardBannerText: { flex: 1 },
  rewardBannerLabel:{ color: 'rgba(255,255,255,0.65)', fontFamily: FontFamily.regular, fontSize: 11 },
  rewardBannerValue:{ color: C.primary, fontFamily: FontFamily.bold, fontSize: 22 },

  listHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.one },
  listTitle:   { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 13 },
  markAllText: { color: C.primary, fontFamily: FontFamily.medium, fontSize: 13 },

  card:        { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, marginBottom: Spacing.two, gap: Spacing.two, position: 'relative' },
  cardUnread:  { borderWidth: 1, borderColor: `${C.primary}40` },
  unreadDot:   { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  iconWrap:    { width: 40, height: 40, borderRadius: Shape.medium, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  cardContent: { flex: 1, gap: 4 },
  cardTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.one },
  cardTitle:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 13, flex: 1 },
  typeBadge:   { borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText:{ fontFamily: FontFamily.medium, fontSize: 10 },
  cardBody:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 18 },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardTime:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  cardReward:  { color: C.primary, fontFamily: FontFamily.bold, fontSize: 12 },
});
