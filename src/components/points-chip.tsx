import { Pressable, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, FontFamily } from '@/constants/theme';
import { useSpectatorPoints } from '@/hooks/useSpectatorData';

export function PointsChip() {
  const { balance } = useSpectatorPoints();
  return (
    <Pressable
      style={styles.chip}
      onPress={() => router.push('/(app)/rewards' as never)}
      android_ripple={{ color: `${C.tertiary}22`, radius: 40, borderless: false }}>
      <Award size={13} color={C.tertiary} />
      <Text style={styles.chipText}>{balance.toLocaleString('vi-VN')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: SC.highest, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 7, overflow: 'hidden' },
  chipText: { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 12 },
});
