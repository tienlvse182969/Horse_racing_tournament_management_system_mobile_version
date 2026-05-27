import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'onSurface'] as string },
        type === 'default'    && styles.default,
        type === 'title'      && styles.title,
        type === 'small'      && styles.small,
        type === 'smallBold'  && styles.smallBold,
        type === 'subtitle'   && styles.subtitle,
        type === 'link'       && styles.link,
        type === 'linkPrimary' && { ...styles.link, color: theme.primary },
        type === 'code'       && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // bodyMedium
  small: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  // labelLarge
  smallBold: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  // bodyLarge
  default: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  // displaySmall
  title: {
    fontFamily: FontFamily.regular,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  // headlineLarge
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  // labelLarge
  link: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  // labelMedium mono
  code: {
    fontFamily: FontFamily.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
});
