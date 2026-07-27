import '@/global.css';

import { useEffect, useState } from 'react';
import { ThemeProvider as NavThemeProvider, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { StartupSplash } from '@/components/startup-splash';
import { FONT_ASSETS } from '@/constants/theme';

import { AuthProvider } from '@/context/AuthContext';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

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
    <AppThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </AppThemeProvider>
  );
}

function ThemedApp() {
  const { paperTheme, navTheme, resolvedScheme } = useAppTheme();
  const [showStartupSplash, setShowStartupSplash] = useState(true);

  return (
    <PaperProvider theme={paperTheme}>
      <NavThemeProvider value={navTheme}>
        <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
        {showStartupSplash && (
          <StartupSplash onFinish={() => setShowStartupSplash(false)} />
        )}
        <Stack screenOptions={{ headerShown: false }} />
      </NavThemeProvider>
    </PaperProvider>
  );
}
