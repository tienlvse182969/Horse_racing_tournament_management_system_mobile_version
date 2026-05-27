import { View, Text, StyleSheet } from 'react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Spacing, FontFamily } from '@/constants/theme';

type AppBarProps = {
  title: string;
  bangers?: boolean;
};

export function AppBar({ title, bangers = false }: AppBarProps) {
  return (
    <View style={styles.container}>
      <Text style={bangers ? styles.titleBangers : styles.titleNormal}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SC.lowest,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.three,
  },
  titleNormal: {
    color: C.onSurface,
    fontFamily: FontFamily.bold,
    fontSize: 34,
    letterSpacing: -0.5,
  },
  titleBangers: {
    color: C.primary,
    fontFamily: FontFamily.bangers,
    fontSize: 40,
    letterSpacing: 3,
  },
});
