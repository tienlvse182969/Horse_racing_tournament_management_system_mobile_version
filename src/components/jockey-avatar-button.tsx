import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Shape, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';
import { currentJockey } from '@/mock-data';

export function JockeyAvatarButton() {
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity style={styles.btn} onPress={() => router.push('/jockey-profile')} activeOpacity={0.75}>
      <Text style={styles.initials}>{currentJockey.initials}</Text>
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
      color: C.primary,
      fontFamily: FontFamily.bold,
      fontSize: 12,
    },
  });
}
