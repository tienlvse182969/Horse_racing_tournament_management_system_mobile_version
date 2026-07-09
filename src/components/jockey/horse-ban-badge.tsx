import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';

import { HorseRacingDark as C, Shape, FontFamily } from '@/constants/theme';
import type { PenaltyStatus } from '@/mock-data';

export function formatBanDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function HorseBanBadge({
  penaltyStatus,
  style,
}: {
  penaltyStatus?: PenaltyStatus | null;
  style?: ViewStyle;
}) {
  if (!penaltyStatus?.isBanned) return null;

  const label = penaltyStatus.bannedUntil
    ? `Bị cấm thi đấu đến ngày ${formatBanDate(penaltyStatus.bannedUntil)}`
    : 'Bị cấm thi đấu vô thời hạn';

  return (
    <View style={[styles.badge, style]}>
      <ShieldAlert size={12} color={C.error} />
      <Text style={styles.text} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: C.errorContainer,
    borderRadius: Shape.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: { color: C.error, fontFamily: FontFamily.bold, fontSize: 10 },
});
