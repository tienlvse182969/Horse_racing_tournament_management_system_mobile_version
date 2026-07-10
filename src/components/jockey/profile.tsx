import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Zap, Trophy, ChartBar, Banknote, ChevronRight, LogOut, UserPen, Lock, Info, X, Star, Target } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { useAuth } from '@/context/AuthContext';
import { currentJockey, formatCurrency } from '@/mock-data';
import type { AchievementType } from '@/mock-data';
import { APP_VERSION } from '@/constants/version';

const ACHIEVEMENT_CONFIG: Record<AchievementType, { bg: string; border: string; label: string }> = {
  gold:    { bg: C.secondaryContainer,  border: C.secondary,         label: 'Vàng' },
  silver:  { bg: SC.high,               border: C.onSurfaceVariant,  label: 'Bạc' },
  bronze:  { bg: '#3A2010',             border: '#FFAB60',           label: 'Đồng' },
  special: { bg: C.primaryContainer,    border: C.primary,           label: 'Đặc biệt' },
};

type AchIconComp = React.ComponentType<{ size?: number; color?: string }>;
const ACHIEVEMENT_ICONS: Record<string, AchIconComp> = {
  trophy:            Trophy,
  'trophy-variant':  Trophy,
  target:            Target,
  star:              Star,
  'star-four-points': Star,
  'lightning-bolt':  Zap,
};

type SettingItem = { Icon: AchIconComp; label: string; onPress: () => void };

export function JockeyProfile() {
  const { user, logout } = useAuth();
  const [aboutVisible, setAboutVisible] = useState(false);

  const displayName = user?.fullName ?? 'Jockey';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();

  const SETTINGS: SettingItem[] = [
    { Icon: UserPen, label: 'Chỉnh sửa hồ sơ', onPress: () => router.push('/edit-profile' as never) },
    { Icon: Lock,    label: 'Đổi mật khẩu',     onPress: () => router.push('/change-password' as never) },
    { Icon: Info,    label: 'Về ứng dụng',      onPress: () => setAboutVisible(true) },
  ];

  const handleLogout = () =>
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/auth' as never); } },
    ]);

  type StatCard = { label: string; value: string | number; Icon: AchIconComp; color: string };
  const careerStats: StatCard[] = [
    { label: 'Tổng cuộc đua', value: currentJockey.stats.totalRaces,                         Icon: Zap,      color: C.primary    },
    { label: 'Chiến thắng',   value: currentJockey.stats.wins,                               Icon: Trophy,   color: C.secondary  },
    { label: 'Hạng Nhì',      value: currentJockey.stats.seconds,                            Icon: Trophy,   color: '#9E9E9E'    },
    { label: 'Hạng Ba',       value: currentJockey.stats.thirds,                             Icon: Trophy,   color: '#CD7F32'    },
    { label: 'Tỷ lệ thắng',  value: `${currentJockey.stats.winRate}%`,                      Icon: ChartBar, color: C.tertiary   },
    { label: 'Tổng thu nhập', value: formatCurrency(currentJockey.stats.earnings),           Icon: Banknote, color: C.secondary  },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Hồ sơ"
          contentContainerStyle={styles.scroll}
          leftAction={
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color={C.onSurface} />
            </TouchableOpacity>
          }>

          {/* Profile hero */}
          <Animated.View entering={FadeIn.duration(380)}>
            <LinearGradient
              colors={['#3B1A00', '#7B3F00', '#C07A00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}>
              <View style={styles.heroBg} />
              <View style={styles.heroRow}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroInitials}>{initials}</Text>
                </View>
                <View style={styles.heroInfo}>
                  <View style={styles.heroRoleRow}>
                    <Zap size={11} color="rgba(255,217,180,0.7)" />
                    <Text style={styles.heroRole}>Jockey Chuyên Nghiệp</Text>
                  </View>
                  <Text style={styles.heroName}>{displayName}</Text>
                  {user?.email && <Text style={styles.heroContact}>{user.email}</Text>}
                  {user?.phone && <Text style={styles.heroContact}>{user.phone}</Text>}
                  <Text style={styles.heroLicense}>
                    Giấy phép: {user?.licenseNumber || 'Chưa cập nhật'}
                  </Text>
                  {user?.licenseExpiry && (
                    <Text style={styles.heroLicense}>
                      Hạn: {new Date(user.licenseExpiry).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Career stats */}
          <Animated.View entering={FadeInDown.delay(80).duration(320)}>
            <Text style={styles.sectionTitle}>Thành tích sự nghiệp</Text>
            <View style={styles.statsGrid}>
              {careerStats.map((s, i) => (
                <Animated.View key={s.label} entering={FadeInDown.delay(100 + i * 40).duration(280)} style={styles.statCard}>
                  <s.Icon size={22} color={s.color} />
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Achievements */}
          <Animated.View entering={FadeInDown.delay(200).duration(320)} style={styles.section}>
            <Text style={styles.sectionTitle}>Thành tích & Danh hiệu</Text>
            {currentJockey.achievements.map((ach, i) => {
              const ac = ACHIEVEMENT_CONFIG[ach.type];
              const AchIcon = ACHIEVEMENT_ICONS[ach.icon] ?? Trophy;
              return (
                <Animated.View key={ach.id} entering={FadeInDown.delay(240 + i * 50).duration(260)}>
                  <View style={[styles.achRow, { backgroundColor: ac.bg, borderColor: `${ac.border}44` }]}>
                    <View style={[styles.achIcon, { backgroundColor: `${ac.border}22` }]}>
                      <AchIcon size={24} color={ac.border} />
                    </View>
                    <View style={styles.achInfo}>
                      <Text style={styles.achTitle}>{ach.title}</Text>
                      <Text style={styles.achDesc}>{ach.description}</Text>
                    </View>
                    <View style={styles.achRight}>
                      <View style={[styles.achTypeBadge, { backgroundColor: `${ac.border}22` }]}>
                        <Text style={[styles.achTypeText, { color: ac.border }]}>{ac.label}</Text>
                      </View>
                      <Text style={styles.achDate}>
                        {new Date(ach.earnedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Settings */}
          <Animated.View entering={FadeInDown.delay(440).duration(320)} style={styles.section}>
            <Text style={styles.sectionTitle}>Cài đặt</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  backBtn: { width: 34, height: 34, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },

  // Hero
  heroCard:    { borderRadius: Shape.large, padding: Spacing.three, overflow: 'hidden' },
  heroBg:      { position: 'absolute', right: -32, top: -32, width: 128, height: 128, borderRadius: Shape.full, backgroundColor: 'rgba(255,217,180,0.08)' },
  heroRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  heroAvatar:  { width: 80, height: 80, borderRadius: Shape.medium, backgroundColor: 'rgba(255,217,180,0.15)', borderWidth: 2, borderColor: 'rgba(255,217,180,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroInitials:{ color: '#FFD9B4', fontFamily: FontFamily.bold, fontSize: 32 },
  heroInfo:    { flex: 1, gap: 3 },
  heroRoleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroRole:    { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.medium, fontSize: 11 },
  heroName:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 20, letterSpacing: -0.3 },
  heroContact: { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 12 },
  heroLicense: { color: 'rgba(255,217,180,0.45)', fontFamily: FontFamily.regular, fontSize: 11 },

  // Stats
  sectionTitle:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  statCard:    { width: '47%', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: 4 },
  statValue:   { fontFamily: FontFamily.bold, fontSize: 22, letterSpacing: -0.5 },
  statLabel:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },

  // Achievements
  section:     { gap: Spacing.two },
  achRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, borderWidth: 1.5, marginBottom: 0 },
  achIcon:     { width: 48, height: 48, borderRadius: Shape.medium, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  achInfo:     { flex: 1, gap: 2 },
  achTitle:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 14 },
  achDesc:     { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  achRight:    { alignItems: 'flex-end', gap: 4 },
  achTypeBadge:{ borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 2 },
  achTypeText: { fontFamily: FontFamily.bold, fontSize: 10 },
  achDate:     { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10 },

  // Settings
  settingRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two, marginBottom: Spacing.one },
  settingIconWrap:{ width: 36, height: 36, borderRadius: Shape.medium, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  settingLabel:   { color: C.onSurface, fontFamily: FontFamily.regular, fontSize: 14, flex: 1 },

  // Logout
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Shape.full, paddingVertical: 14, borderWidth: 1, borderColor: C.error },
  logoutText:  { color: C.error, fontFamily: FontFamily.bold, fontSize: 15 },

  // About modal
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
  modalCard:      { width: '100%', maxWidth: 320, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.four, alignItems: 'center', gap: Spacing.one },
  modalCloseBtn:  { position: 'absolute', top: Spacing.two, right: Spacing.two, width: 32, height: 32, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  modalAppName:   { color: C.primary, fontFamily: FontFamily.bangers, fontSize: 28, letterSpacing: 2, marginTop: Spacing.two },
  modalVersion:   { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },
});
