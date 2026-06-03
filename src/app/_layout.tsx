import '@/global.css';

import { useEffect } from 'react';
import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FONT_ASSETS, HorseRacingTheme, HorseRacingDark } from '@/constants/theme';

import { AuthProvider } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

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
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <PaperProvider theme={HorseRacingTheme}>
        <ThemeProvider value={navTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
