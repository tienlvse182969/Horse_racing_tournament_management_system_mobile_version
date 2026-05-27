import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, FontFamily } from '@/constants/theme';
import { currentJockey } from '@/mock-data';

export function JockeyAvatarButton() {
  return (
    <TouchableOpacity style={styles.btn} onPress={() => router.push('/jockey-profile')} activeOpacity={0.75}>
      <Text style={styles.initials}>{currentJockey.initials}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
