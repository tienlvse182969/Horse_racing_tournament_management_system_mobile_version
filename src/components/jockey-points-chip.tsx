import { View, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';

import { Shape, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useJockeyPoints } from '@/hooks/useJockeyData';

export function JockeyPointsChip() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { balance } = useJockeyPoints();
  return (
    <View style={styles.chip}>
      <Award size={13} color={C.tertiary} />
      <Text style={styles.chipText}>{balance.toLocaleString('vi-VN')}</Text>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
    chip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: SC.highest, borderRadius: Shape.full, paddingHorizontal: 10, paddingVertical: 7 },
    chipText: { color: C.tertiary, fontFamily: FontFamily.bold, fontSize: 12 },
  });
}
