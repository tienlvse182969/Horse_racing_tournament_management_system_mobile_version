import '@/global.css';

import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { PaperProvider } from 'react-native-paper';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FONT_ASSETS, HorseRacingTheme, HorseRacingDark } from '@/constants/theme';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background:   HorseRacingDark.background,
    card:         HorseRacingDark.surface,
    text:         HorseRacingDark.onSurface,
    border:       HorseRacingDark.outlineVariant,
    notification: HorseRacingDark.primary,
    primary:      HorseRacingDark.primary,
  },
};

export default function RootLayout() {
  useFonts(FONT_ASSETS);

  return (
    <PaperProvider theme={HorseRacingTheme}>
      <ThemeProvider value={navTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </PaperProvider>
  );
}
