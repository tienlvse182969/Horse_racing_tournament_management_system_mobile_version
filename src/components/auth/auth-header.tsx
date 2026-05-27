import { View, Text, StyleSheet } from 'react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Spacing, FontFamily } from '@/constants/theme';

export function AuthHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.appName}>RaceTrack VN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
