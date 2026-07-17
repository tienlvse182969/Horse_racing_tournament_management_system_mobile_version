import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from 'react-native-paper';
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities';
import { Platform } from 'react-native';

// ── Seed Color ────────────────────────────────────────────────────────────────
// Thay hex này để regenerate toàn bộ color scheme của app
export const SEED_COLOR = '#208AEF';

// ── Font Families (HarmonyOS Sans) ────────────────────────────────────────────
export const FontFamily = {
  regular: 'HarmonyOS-Sans-Regular',
  medium: 'HarmonyOS-Sans-Medium',
  bold: 'HarmonyOS-Sans-Bold',
  bangers: 'Bangers-Regular',
  mono: Platform.select({
    web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    default: 'monospace',
  })!,
};

// Font assets cho useFonts() — download HarmonyOS Sans vào assets/fonts/ rồi bỏ comment
// Tải font tại: https://developer.huawei.com/consumer/en/doc/design-guides/font-0000001157868583
// Cần các file: HarmonyOS_Sans_Regular.ttf, HarmonyOS_Sans_Medium.ttf, HarmonyOS_Sans_Bold.ttf
export const FONT_ASSETS: Record<string, number> = {
  'HarmonyOS-Sans-Regular': require('@/assets/fonts/HarmonyOS_Sans_Regular.ttf'),
  'HarmonyOS-Sans-Medium': require('@/assets/fonts/HarmonyOS_Sans_Medium.ttf'),
  'HarmonyOS-Sans-Bold': require('@/assets/fonts/HarmonyOS_Sans_Bold.ttf'),
  'Bangers-Regular': require('@/assets/fonts/Bangers-Regular.ttf'),
};

// ── M3 Type Scale (react-native-paper configureFonts) ─────────────────────────
const paperFonts = configureFonts({
  config: {
    displayLarge:   { fontFamily: FontFamily.regular, fontSize: 57, fontWeight: '400', letterSpacing: -0.25, lineHeight: 64 },
    displayMedium:  { fontFamily: FontFamily.regular, fontSize: 45, fontWeight: '400', letterSpacing: 0,     lineHeight: 52 },
    displaySmall:   { fontFamily: FontFamily.regular, fontSize: 36, fontWeight: '400', letterSpacing: 0,     lineHeight: 44 },
    headlineLarge:  { fontFamily: FontFamily.regular, fontSize: 32, fontWeight: '400', letterSpacing: 0,     lineHeight: 40 },
    headlineMedium: { fontFamily: FontFamily.regular, fontSize: 28, fontWeight: '400', letterSpacing: 0,     lineHeight: 36 },
    headlineSmall:  { fontFamily: FontFamily.regular, fontSize: 24, fontWeight: '400', letterSpacing: 0,     lineHeight: 32 },
    titleLarge:     { fontFamily: FontFamily.regular, fontSize: 22, fontWeight: '400', letterSpacing: 0,     lineHeight: 28 },
    titleMedium:    { fontFamily: FontFamily.medium,  fontSize: 16, fontWeight: '500', letterSpacing: 0.15,  lineHeight: 24 },
    titleSmall:     { fontFamily: FontFamily.medium,  fontSize: 14, fontWeight: '500', letterSpacing: 0.1,   lineHeight: 20 },
    bodyLarge:      { fontFamily: FontFamily.regular, fontSize: 16, fontWeight: '400', letterSpacing: 0.5,   lineHeight: 24 },
    bodyMedium:     { fontFamily: FontFamily.regular, fontSize: 14, fontWeight: '400', letterSpacing: 0.25,  lineHeight: 20 },
    bodySmall:      { fontFamily: FontFamily.regular, fontSize: 12, fontWeight: '400', letterSpacing: 0.4,   lineHeight: 16 },
    labelLarge:     { fontFamily: FontFamily.medium,  fontSize: 14, fontWeight: '500', letterSpacing: 0.1,   lineHeight: 20 },
    labelMedium:    { fontFamily: FontFamily.medium,  fontSize: 12, fontWeight: '500', letterSpacing: 0.5,   lineHeight: 16 },
    labelSmall:     { fontFamily: FontFamily.medium,  fontSize: 11, fontWeight: '500', letterSpacing: 0.5,   lineHeight: 16 },
  },
});

// ── M3 Color Scheme (generated from seed) ────────────────────────────────────
function buildPaperTheme(seedHex: string) {
  const mat = themeFromSourceColor(argbFromHex(seedHex));

  function mapColors(
    s: typeof mat.schemes.light,
    base: typeof MD3LightTheme,
  ) {
    return {
      ...base.colors,
      primary:              hexFromArgb(s.primary),
      onPrimary:            hexFromArgb(s.onPrimary),
      primaryContainer:     hexFromArgb(s.primaryContainer),
      onPrimaryContainer:   hexFromArgb(s.onPrimaryContainer),
      secondary:            hexFromArgb(s.secondary),
      onSecondary:          hexFromArgb(s.onSecondary),
      secondaryContainer:   hexFromArgb(s.secondaryContainer),
      onSecondaryContainer: hexFromArgb(s.onSecondaryContainer),
      tertiary:             hexFromArgb(s.tertiary),
      onTertiary:           hexFromArgb(s.onTertiary),
      tertiaryContainer:    hexFromArgb(s.tertiaryContainer),
      onTertiaryContainer:  hexFromArgb(s.onTertiaryContainer),
      error:                hexFromArgb(s.error),
      onError:              hexFromArgb(s.onError),
      errorContainer:       hexFromArgb(s.errorContainer),
      onErrorContainer:     hexFromArgb(s.onErrorContainer),
      background:           hexFromArgb(s.background),
      onBackground:         hexFromArgb(s.onBackground),
      surface:              hexFromArgb(s.surface),
      onSurface:            hexFromArgb(s.onSurface),
      surfaceVariant:       hexFromArgb(s.surfaceVariant),
      onSurfaceVariant:     hexFromArgb(s.onSurfaceVariant),
      outline:              hexFromArgb(s.outline),
      outlineVariant:       hexFromArgb(s.outlineVariant),
      shadow:               hexFromArgb(s.shadow),
      scrim:                hexFromArgb(s.scrim),
      inverseSurface:       hexFromArgb(s.inverseSurface),
      inverseOnSurface:     hexFromArgb(s.inverseOnSurface),
      inversePrimary:       hexFromArgb(s.inversePrimary),
    };
  }

  return {
    light: { ...MD3LightTheme, fonts: paperFonts, colors: mapColors(mat.schemes.light, MD3LightTheme) },
    dark:  { ...MD3DarkTheme,  fonts: paperFonts, colors: mapColors(mat.schemes.dark,  MD3DarkTheme)  },
  };
}

export const PaperTheme = buildPaperTheme(SEED_COLOR);

export type AppColorScheme = typeof PaperTheme.light.colors;
export type ThemeColor = keyof AppColorScheme;

// ── M3 Expressive Shape Scale ─────────────────────────────────────────────────
export const Shape = {
  none:       0,
  extraSmall: 4,
  small:      8,
  medium:     12,
  large:      16,
  extraLarge: 28,
  full:       999,
} as const;

// ── M3 Elevation (dp) ─────────────────────────────────────────────────────────
export const Elevation = {
  level0: 0,
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 8,
  level5: 12,
} as const;

// ── Spacing ───────────────────────────────────────────────────────────────────
export const Spacing = {
  half:  2,
  one:   4,
  two:   8,
  three: 16,
  four:  24,
  five:  32,
  six:   64,
} as const;

// Legacy aliases
export const Colors = { light: PaperTheme.light.colors, dark: PaperTheme.dark.colors } as const;
export const Fonts = FontFamily;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ── Horse Racing Theme (always dark, amber/green palette) ─────────────────────
export const HorseRacingDark = {
  primary:              '#FFB86C',
  onPrimary:            '#462200',
  primaryContainer:     '#643400',
  onPrimaryContainer:   '#FFDDB5',
  secondary:            '#FFCB66',
  onSecondary:          '#403200',
  secondaryContainer:   '#5C4900',
  onSecondaryContainer: '#FFDE9D',
  tertiary:             '#72D79A',
  onTertiary:           '#003920',
  tertiaryContainer:    '#00522E',
  onTertiaryContainer:  '#8EF5B6',
  error:                '#FFB4AB',
  onError:              '#690005',
  errorContainer:       '#93000A',
  onErrorContainer:     '#FFDAD6',
  background:           '#100C06',
  onBackground:         '#EFE0CC',
  surface:              '#1C1409',
  onSurface:            '#EFE0CC',
  surfaceVariant:       '#4E3F2F',
  onSurfaceVariant:     '#D1C0AA',
  outline:              '#9A8675',
  outlineVariant:       '#4E3F2F',
  shadow:               '#000000',
  scrim:                '#000000',
  inverseSurface:       '#EFE0CC',
  inverseOnSurface:     '#382D1F',
  inversePrimary:       '#854E00',
  surfaceDisabled:      'rgba(239,224,204,0.12)',
  onSurfaceDisabled:    'rgba(239,224,204,0.38)',
  backdrop:             'rgba(0,0,0,0.7)',
} as const;

// M3 surface container tokens (not in Paper v5 base type — use directly)
export const SurfaceContainers = {
  lowest:  '#100C06',
  low:     '#1C1409',
  base:    '#261810',
  high:    '#302015',
  highest: '#3C2918',
} as const;

export const HorseRacingTheme = {
  ...MD3DarkTheme,
  fonts: paperFonts,
  colors: {
    ...MD3DarkTheme.colors,
    ...HorseRacingDark,
  },
};

// ── Horse Racing Theme (light counterpart, same amber/green brand hues) ───────
export const HorseRacingLight = {
  primary:              '#8B5000',
  onPrimary:            '#FFFFFF',
  primaryContainer:     '#FFDDB5',
  onPrimaryContainer:   '#2B1700',
  secondary:            '#7A5900',
  onSecondary:          '#FFFFFF',
  secondaryContainer:   '#FFDE9D',
  onSecondaryContainer: '#251A00',
  tertiary:             '#1F6F44',
  onTertiary:           '#FFFFFF',
  tertiaryContainer:    '#8EF5B6',
  onTertiaryContainer:  '#00210E',
  error:                '#BA1A1A',
  onError:              '#FFFFFF',
  errorContainer:       '#FFDAD6',
  onErrorContainer:     '#410002',
  background:           '#FFF8F0',
  onBackground:         '#211A10',
  surface:              '#FFF8F0',
  onSurface:            '#211A10',
  surfaceVariant:       '#F0E0CB',
  onSurfaceVariant:     '#4E3F2F',
  outline:              '#817567',
  outlineVariant:       '#D3C4B4',
  shadow:               '#000000',
  scrim:                '#000000',
  inverseSurface:       '#382D1F',
  inverseOnSurface:     '#FBEEDC',
  inversePrimary:       '#FFB86C',
  surfaceDisabled:      'rgba(33,26,16,0.12)',
  onSurfaceDisabled:    'rgba(33,26,16,0.38)',
  backdrop:             'rgba(0,0,0,0.5)',
} as const satisfies Record<keyof typeof HorseRacingDark, string>;

// M3 surface container tokens — light scheme (lowest = near-background, highest = most elevated/tinted)
export const SurfaceContainersLight = {
  lowest:  '#FFFFFF',
  low:     '#FBF8F3',
  base:    '#F7F3EA',
  high:    '#F2EDE1',
  highest: '#ECE4D3',
} as const satisfies Record<keyof typeof SurfaceContainers, string>;

export const HorseRacingLightTheme = {
  ...MD3LightTheme,
  fonts: paperFonts,
  colors: {
    ...MD3LightTheme.colors,
    ...HorseRacingLight,
  },
};

export type AppColors = Record<keyof typeof HorseRacingDark, string>;
export type SurfaceColors = Record<keyof typeof SurfaceContainers, string>;
