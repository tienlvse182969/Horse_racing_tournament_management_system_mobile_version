import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DarkTheme, DefaultTheme } from 'expo-router';

import {
  HorseRacingDark,
  HorseRacingLight,
  HorseRacingTheme,
  HorseRacingLightTheme,
  SurfaceContainers,
  SurfaceContainersLight,
  type AppColors,
  type SurfaceColors,
} from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'horse-racing-theme-mode';
const isWeb = Platform.OS === 'web';

async function getStoredMode(): Promise<ThemeMode | null> {
  try {
    const raw = isWeb ? localStorage.getItem(STORAGE_KEY) : await SecureStore.getItemAsync(STORAGE_KEY);
    return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : null;
  } catch {
    return null;
  }
}

async function persistMode(mode: ThemeMode): Promise<void> {
  try {
    if (isWeb) localStorage.setItem(STORAGE_KEY, mode);
    else await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    // Persistence failure just means the choice won't survive a restart — theme still applies now.
  }
}

interface AppThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  C: AppColors;
  SC: SurfaceColors;
  paperTheme: typeof HorseRacingTheme | typeof HorseRacingLightTheme;
  navTheme: typeof DarkTheme;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  // New users have no stored preference yet, so default to 'system' until getStoredMode() resolves.
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    getStoredMode().then(stored => {
      if (stored) setModeState(stored);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    persistMode(next);
  }, []);

  const resolvedScheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;

  const value = useMemo<AppThemeContextValue>(() => {
    const isDark = resolvedScheme === 'dark';
    const C = isDark ? HorseRacingDark : HorseRacingLight;
    const SC = isDark ? SurfaceContainers : SurfaceContainersLight;
    const paperTheme = isDark ? HorseRacingTheme : HorseRacingLightTheme;
    const navBase = isDark ? DarkTheme : DefaultTheme;

    const navTheme = {
      ...navBase,
      colors: {
        ...navBase.colors,
        background:   C.background,
        card:         C.surface,
        text:         C.onSurface,
        border:       C.outlineVariant,
        notification: C.primary,
        primary:      C.primary,
      },
    };

    return { mode, resolvedScheme, setMode, C, SC, paperTheme, navTheme };
  }, [mode, resolvedScheme, setMode]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}
