import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Shape, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';
import { currentSpectator } from '@/mock-data';

export function AvatarTabButton() {
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity style={styles.btn} onPress={() => router.push('/profile')} activeOpacity={0.75}>
      <Text style={styles.initials}>{currentSpectator.initials}</Text>
    </TouchableOpacity>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
    btn: {
      width: 34,
      height: 34,
      borderRadius: Shape.full,
      backgroundColor: SC.highest,
      justifyContent: 'center',
      alignItems: 'center',
    },
    initials: {
      color: C.tertiary,
      fontFamily: FontFamily.bold,
      fontSize: 12,
    },
  });
}
