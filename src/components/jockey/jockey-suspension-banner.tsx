import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldAlert, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

import { HorseRacingDark as C, Shape, Spacing, FontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { formatBanDate } from './horse-ban-badge';

export function JockeySuspensionBanner() {
  const { user } = useAuth();
  const penalty = user?.penaltyStatus;

  if (!penalty?.isBanned) return null;

  const label = penalty.bannedUntil
    ? `Bạn đang bị đình chỉ thi đấu đến ngày ${formatBanDate(penalty.bannedUntil)}`
    : 'Bạn đang bị đình chỉ thi đấu đến ngày ...';

  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <ShieldAlert size={18} color={C.error} />
        <Text style={styles.text}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.learnMoreBtn}
        activeOpacity={0.7}
        onPress={() => router.push('/jockey/penalty-detail' as any)}>
        <Text style={styles.learnMoreText}>Tìm hiểu thêm</Text>
        <ChevronRight size={14} color={C.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: Spacing.one,
    backgroundColor: C.errorContainer,
    borderRadius: Shape.large,
    padding: Spacing.two,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  text: { flex: 1, color: C.error, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 18 },
  learnMoreBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 2 },
  learnMoreText: { color: C.error, fontFamily: FontFamily.bold, fontSize: 12 },
});
