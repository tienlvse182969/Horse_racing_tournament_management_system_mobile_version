import { useMemo } from 'react';
import type { StyleSheet } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import type { AppColors, SurfaceColors } from '@/constants/theme';

export function useTheme() {
  return useAppTheme().paperTheme.colors;
}

export function useAppColors() {
  const { C, SC } = useAppTheme();
  return { C, SC };
}

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (C: AppColors, SC: SurfaceColors) => T,
): T {
  const { C, SC } = useAppTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(C, SC), [C, SC]);
}
