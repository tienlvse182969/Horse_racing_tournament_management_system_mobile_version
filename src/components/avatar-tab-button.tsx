import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, FontFamily } from '@/constants/theme';
import { currentSpectator } from '@/mock-data';

export function AvatarTabButton() {
  return (
    <TouchableOpacity style={styles.btn} onPress={() => router.push('/profile')} activeOpacity={0.75}>
      <Text style={styles.initials}>{currentSpectator.initials}</Text>
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
    color: C.tertiary,
    fontFamily: FontFamily.bold,
    fontSize: 12,
  },
});
