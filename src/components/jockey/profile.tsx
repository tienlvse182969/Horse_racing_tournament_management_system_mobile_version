import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { currentJockey, formatCurrency } from '@/mock-data';
import type { AchievementType } from '@/mock-data';

const ACHIEVEMENT_CONFIG: Record<AchievementType, { bg: string; border: string; label: string }> = {
  gold:    { bg: C.secondaryContainer,  border: C.secondary,         label: 'Vàng' },
  silver:  { bg: SC.high,               border: C.onSurfaceVariant,  label: 'Bạc' },
  bronze:  { bg: '#3A2010',             border: '#FFAB60',           label: 'Đồng' },
  special: { bg: C.primaryContainer,    border: C.primary,           label: 'Đặc biệt' },
};

const SETTINGS = [
  { icon: 'account-edit-outline',  label: 'Chỉnh sửa hồ sơ' },
  { icon: 'bell-outline',          label: 'Cài đặt thông báo' },
  { icon: 'lock-outline',          label: 'Bảo mật' },
  { icon: 'help-circle-outline',   label: 'Trợ giúp & Hỗ trợ' },
];

export function JockeyProfile() {
  const handleLogout = () =>
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => router.replace('/(auth)/auth' as never) },
    ]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Hồ sơ"
          contentContainerStyle={styles.scroll}
          leftAction={
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={C.onSurface} />
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
                  <Text style={styles.heroInitials}>{currentJockey.initials}</Text>
                </View>
                <View style={styles.heroInfo}>
                  <Text style={styles.heroRole}>🏇 Jockey Chuyên Nghiệp</Text>
                  <Text style={styles.heroName}>{currentJockey.name}</Text>
                  <Text style={styles.heroNationality}>
                    🇻🇳 {currentJockey.nationality} · {currentJockey.age} tuổi
                  </Text>
                  <Text style={styles.heroLicense}>{currentJockey.licenseNumber}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Career stats */}
          <Animated.View entering={FadeInDown.delay(80).duration(320)}>
            <Text style={styles.sectionTitle}>Thành tích sự nghiệp</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Tổng cuộc đua', value: currentJockey.stats.totalRaces, icon: '🏇', color: C.primary },
                { label: 'Chiến thắng',   value: currentJockey.stats.wins,       icon: '🏆', color: C.secondary },
                { label: 'Hạng Nhì',      value: currentJockey.stats.seconds,    icon: '🥈', color: C.onSurfaceVariant },
                { label: 'Hạng Ba',       value: currentJockey.stats.thirds,     icon: '🥉', color: '#FFAB60' },
                { label: 'Tỷ lệ thắng',  value: `${currentJockey.stats.winRate}%`, icon: '📊', color: C.tertiary },
                { label: 'Tổng thu nhập', value: formatCurrency(currentJockey.stats.earnings), icon: '💰', color: C.secondary },
              ].map((s, i) => (
                <Animated.View key={s.label} entering={FadeInDown.delay(100 + i * 40).duration(280)} style={styles.statCard}>
                  <Text style={{ fontSize: 22 }}>{s.icon}</Text>
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
              return (
                <Animated.View key={ach.id} entering={FadeInDown.delay(240 + i * 50).duration(260)}>
                  <View style={[styles.achRow, { backgroundColor: ac.bg, borderColor: `${ac.border}44` }]}>
                    <View style={[styles.achIcon, { backgroundColor: `${ac.border}22` }]}>
                      <Text style={{ fontSize: 24 }}>{ach.icon}</Text>
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
              <TouchableOpacity key={s.label} style={styles.settingRow} activeOpacity={0.75}>
                <View style={styles.settingIconWrap}>
                  <MaterialCommunityIcons name={s.icon as any} size={20} color={C.onSurfaceVariant} />
                </View>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <MaterialCommunityIcons name="logout" size={18} color={C.error} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

        </LargeHeaderScrollView>
      </SafeAreaView>
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
  heroRole:    { color: 'rgba(255,217,180,0.7)', fontFamily: FontFamily.medium, fontSize: 11 },
  heroName:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 20, letterSpacing: -0.3 },
  heroNationality: { color: 'rgba(255,217,180,0.6)', fontFamily: FontFamily.regular, fontSize: 12 },
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
});
