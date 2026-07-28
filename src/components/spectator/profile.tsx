import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Pressable, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar, Target, CircleCheck, CircleX, Star, ChartBar,
  Clock, ChevronRight, LogOut, Lock, Info, X, Wallet, SunMoon, Bell, User,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { BackButton } from '@/components/back-button';
import { ThemeModeSheet } from '@/components/theme-mode-sheet';
import { useAuth } from '@/context/AuthContext';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useSpectatorPoints, useSpectatorPredictions } from '@/hooks/useSpectatorData';
import { formatCurrency, formatDate, formatNumber } from '@/mock-data';
import { APP_VERSION } from '@/constants/version';
import { useNotificationSetting } from '@/hooks/useNotificationSetting';

type SettingItem = { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string; onPress: () => void };

export function SpectatorProfile() {
  const { user, logout } = useAuth();
  const { C, SC } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { balance } = useSpectatorPoints();
  const { predictions, loading } = useSpectatorPredictions();
  const [aboutVisible, setAboutVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const notificationSetting = useNotificationSetting();

  const STATUS_CONFIG = useMemo(() => ({
    won:     { color: C.tertiary,  bg: C.tertiaryContainer,  label: 'Đúng' },
    partial: { color: C.primary,   bg: C.primaryContainer,   label: 'Một phần' },
    lost:    { color: C.error,     bg: C.errorContainer,     label: 'Sai' },
    pending: { color: C.secondary, bg: C.secondaryContainer, label: 'Chờ' },
    cancelled: { color: C.onSurfaceVariant, bg: SC.high, label: 'Đã hủy' },
  }), [C, SC]);

  const SETTINGS: SettingItem[] = [
    { Icon: Lock, label: 'Đổi mật khẩu', onPress: () => router.push('/change-password' as never) },
    { Icon: SunMoon, label: 'Giao diện', onPress: () => setThemeVisible(true) },
    { Icon: Info, label: 'Về ứng dụng',   onPress: () => setAboutVisible(true) },
  ];
  const won = predictions.filter(p => p.status === 'won').length;
  const lost = predictions.filter(p => p.status === 'lost').length;
  const pending = predictions.filter(p => p.status === 'pending').length;
  const total = predictions.length;
  const winPct = total > 0 ? Math.round((won / total) * 100) : 0;

  type StatItem = { label: string; value: string | number; Icon: React.ComponentType<{ size?: number; color?: string }> };
  const STATS: StatItem[] = [
    { label: 'Dự đoán',     value: total,                           Icon: Target      },
    { label: 'Đoán đúng',   value: won,                             Icon: CircleCheck },
    { label: 'Đoán sai',    value: lost,                            Icon: CircleX     },
    { label: 'Điểm thưởng', value: formatNumber(  balance),            Icon: Star     },
    { label: 'Tỷ lệ đúng',  value: `${winPct}%`,                   Icon: ChartBar    },
    { label: 'Đang chờ',    value: pending,                         Icon: Clock       },
  ];

  const recentPreds = predictions.slice(0, 4);
  const displayName = user?.fullName ?? 'Khán giả';

  const handleLogout = () =>
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/auth' as never); } },
    ]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Hồ sơ"
          contentContainerStyle={styles.scroll}
          leftAction={<BackButton />}>

          {/* Hero */}
          <Animated.View entering={FadeIn.duration(350)}>
            <LinearGradient
              colors={['#003520', '#1A5C3A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}>
              <View style={styles.heroAvatar}>
                <User size={32} color={C.tertiary} />
              </View>
              <Text style={styles.heroName}>{displayName}</Text>
              <Text style={styles.heroPhone}>{user?.email ?? ''}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Stats grid */}
          <Animated.View entering={FadeInDown.delay(80).duration(320)}>
            <View style={styles.statsGrid}>
              {STATS.map(s => (
                <View key={s.label} style={styles.statCard}>
                  <s.Icon size={20} color={C.primary} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {loading && <ActivityIndicator color={C.primary} style={{ marginVertical: Spacing.three }} />}

          {/* Recent predictions */}
          <Animated.View entering={FadeInDown.delay(200).duration(320)} style={styles.section}>
            <Text style={styles.sectionTitle}>Dự đoán gần đây</Text>
            {recentPreds.map(p => {
              const cfg = STATUS_CONFIG[p.status];
              return (
                <View key={p.id} style={styles.predRow}>
                  <View style={styles.predInfo}>
                    <Text style={styles.predRace} numberOfLines={1}>{p.raceName}</Text>
                    <Text style={styles.predHorse}>#{p.predictedHorseNumber} {p.predictedHorseName}</Text>
                  </View>
                  <View style={[styles.predBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.predBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>

          {/* Settings */}
          <Animated.View entering={FadeInDown.delay(260).duration(320)} style={styles.section}>
            <Text style={styles.sectionTitle}>Cài đặt</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingIconWrap}>
                <Bell size={20} color={C.onSurfaceVariant} />
              </View>
              <Text style={styles.settingLabel}>Thông báo</Text>
              <Switch
                value={notificationSetting.enabled}
                disabled={notificationSetting.loading}
                onValueChange={() => notificationSetting.toggle().catch(() => {})}
                trackColor={{ false: SC.highest, true: C.primaryContainer }}
                thumbColor={notificationSetting.enabled ? C.primary : C.onSurfaceVariant}
              />
            </View>
            {SETTINGS.map(s => (
              <TouchableOpacity key={s.label} style={styles.settingRow} activeOpacity={0.75} onPress={s.onPress}>
                <View style={styles.settingIconWrap}>
                  <s.Icon size={20} color={C.onSurfaceVariant} />
                </View>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <ChevronRight size={18} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <LogOut size={18} color={C.error} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

        </LargeHeaderScrollView>
      </SafeAreaView>

      <Modal
        visible={aboutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAboutVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setAboutVisible(false)} activeOpacity={0.7}>
              <X size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
            <Text style={styles.modalAppName}>RaceTrack VN</Text>
            <Text style={styles.modalVersion}>Phiên bản {APP_VERSION}</Text>
          </Pressable>
        </Pressable>
      </Modal>

      <ThemeModeSheet visible={themeVisible} onClose={() => setThemeVisible(false)} />
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  // Hero
  hero:        { borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: Spacing.two },
  heroAvatar:  { width: 72, height: 72, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.one },
  heroName:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 22 },
  heroPhone:   { color: 'rgba(255,255,255,0.65)', fontFamily: FontFamily.regular, fontSize: 13 },
  heroChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: Shape.full, paddingHorizontal: 12, paddingVertical: 5 },
  heroChipText:{ color: C.tertiary, fontFamily: FontFamily.medium, fontSize: 11 },

  // Stats
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  statCard:   { width: '30.5%', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, alignItems: 'center', gap: 3 },
  statValue:  { color: C.primary, fontFamily: FontFamily.bold, fontSize: 16 },
  statLabel:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10, textAlign: 'center' },

  section:     { gap: Spacing.two },
  sectionTitle:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },

  // Predictions
  predRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.medium, padding: Spacing.two, gap: Spacing.two, marginBottom: Spacing.one },
  predInfo:     { flex: 1 },
  predRace:     { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  predHorse:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11, marginTop: 2 },
  predBadge:    { borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 4 },
  predBadgeText:{ fontFamily: FontFamily.bold, fontSize: 11 },

  // Settings
  settingRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, marginBottom: Spacing.one },
  settingIconWrap:{ width: 36, height: 36, borderRadius: Shape.medium, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  settingLabel:  { color: C.onSurface, fontFamily: FontFamily.regular, fontSize: 14, flex: 1 },

  // Back button

  // Logout
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Shape.full, paddingVertical: 14, borderWidth: 1, borderColor: C.error, marginTop: Spacing.one },
  logoutText: { color: C.error, fontFamily: FontFamily.bold, fontSize: 15 },

  // About modal
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
  modalCard:      { width: '100%', maxWidth: 320, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.four, alignItems: 'center', gap: Spacing.one },
  modalCloseBtn:  { position: 'absolute', top: Spacing.two, right: Spacing.two, width: 32, height: 32, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  modalAppName:   { color: C.primary, fontFamily: FontFamily.bangers, fontSize: 28, letterSpacing: 2, marginTop: Spacing.two },
  modalVersion:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },
  });
}
