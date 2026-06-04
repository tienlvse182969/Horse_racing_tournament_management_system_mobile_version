import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Calendar, Target, CircleCheck, CircleX, Star, ChartBar,
  Clock, ChevronRight, LogOut, Bell, Lock, CircleQuestionMark, Info,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { useAuth } from '@/context/AuthContext';
import { useSpectatorPoints, useSpectatorPredictions } from '@/hooks/useSpectatorData';
import { formatCurrency, formatDate } from '@/mock-data';

type SettingItem = { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string };

const SETTINGS: SettingItem[] = [
  { Icon: Bell,               label: 'Cài đặt thông báo' },
  { Icon: Lock,               label: 'Đổi mật khẩu' },
  { Icon: CircleQuestionMark, label: 'Trợ giúp & Hỗ trợ' },
  { Icon: Info,               label: 'Về ứng dụng' },
];

const STATUS_CONFIG = {
  won:     { color: C.tertiary,  bg: C.tertiaryContainer,  label: 'Đúng' },
  lost:    { color: C.error,     bg: C.errorContainer,     label: 'Sai' },
  pending: { color: C.secondary, bg: C.secondaryContainer, label: 'Chờ' },
};

export function SpectatorProfile() {
  const { user, logout } = useAuth();
  const { balance } = useSpectatorPoints();
  const { predictions } = useSpectatorPredictions();
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
    { label: 'Điểm thưởng', value: `${(balance / 1000).toFixed(0)}k`, Icon: Star     },
    { label: 'Tỷ lệ đúng',  value: `${winPct}%`,                   Icon: ChartBar    },
    { label: 'Đang chờ',    value: pending,                         Icon: Clock       },
  ];

  const recentPreds = predictions.slice(0, 4);
  const displayName = user?.fullName ?? 'Khán giả';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();

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
          leftAction={
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color={C.onSurface} />
            </TouchableOpacity>
          }>

          {/* Hero */}
          <Animated.View entering={FadeIn.duration(350)}>
            <LinearGradient
              colors={['#003520', '#1A5C3A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}>
              <View style={styles.heroAvatar}>
                <Text style={styles.heroInitials}>{initials}</Text>
              </View>
              <Text style={styles.heroName}>{displayName}</Text>
              <Text style={styles.heroPhone}>{user?.email ?? ''}</Text>
              <View style={styles.heroChip}>
                <Calendar size={12} color={C.tertiary} />
                <Text style={styles.heroChipText}>{balance.toLocaleString()} điểm</Text>
              </View>
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

          {/* Prediction accuracy bar */}
          <Animated.View entering={FadeInDown.delay(140).duration(320)} style={styles.section}>
            <Text style={styles.sectionTitle}>Tỷ lệ đoán trúng & sai</Text>
            <View style={styles.barRow}>
              {won > 0 && (
                <View style={[styles.barSeg, { flex: won, backgroundColor: C.tertiary }]} />
              )}
              {lost > 0 && (
                <View style={[styles.barSeg, { flex: lost, backgroundColor: C.error }]} />
              )}
            </View>
            <View style={styles.barLegend}>
              <LegendItem color={C.tertiary} label={`Trúng (${won})`} />
              <LegendItem color={C.error}    label={`Sai (${lost})`} />
            </View>
          </Animated.View>

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
            {SETTINGS.map(s => (
              <TouchableOpacity key={s.label} style={styles.settingRow} activeOpacity={0.75}>
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
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  // Hero
  hero:        { borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: Spacing.two },
  heroAvatar:  { width: 72, height: 72, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.one },
  heroInitials:{ color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 28 },
  heroName:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontSize: 22 },
  heroPhone:   { color: 'rgba(255,255,255,0.65)', fontFamily: FontFamily.regular, fontSize: 13 },
  heroChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: Shape.full, paddingHorizontal: 12, paddingVertical: 5 },
  heroChipText:{ color: C.tertiary, fontFamily: FontFamily.medium, fontSize: 11 },

  // Stats
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  statCard:   { width: '30.5%', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.two, alignItems: 'center', gap: 3 },
  statValue:  { color: C.primary, fontFamily: FontFamily.bold, fontSize: 16 },
  statLabel:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 10, textAlign: 'center' },

  // Win rate bar
  section:     { gap: Spacing.two },
  sectionTitle:{ color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  barRow:      { flexDirection: 'row', height: 10, borderRadius: Shape.full, overflow: 'hidden', gap: 1 },
  barSeg:      { borderRadius: Shape.full },
  barLegend:   { flexDirection: 'row', gap: Spacing.three },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },

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
  backBtn: {
    width: 34, height: 34, borderRadius: Shape.full,
    backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center',
  },

  // Logout
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Shape.full, paddingVertical: 14, borderWidth: 1, borderColor: C.error, marginTop: Spacing.one },
  logoutText: { color: C.error, fontFamily: FontFamily.bold, fontSize: 15 },
});
