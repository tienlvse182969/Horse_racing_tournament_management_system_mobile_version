import { View, Text, StyleSheet } from 'react-native';

import { Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';

export function AuthHeader() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.header}>
      <Text style={styles.appName}>RaceTrack VN</Text>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
    header: {
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      backgroundColor: SC.high,
    },
    appName: {
      color: C.primary,
      fontFamily: FontFamily.bangers,
      fontSize: 32,
      letterSpacing: 3,
      textAlign: 'center',
    },
  });
}
