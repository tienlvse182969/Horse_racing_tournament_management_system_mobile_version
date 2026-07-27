import { View, Text, StyleSheet } from 'react-native';

import { FontFamily, Spacing } from '@/constants/theme';
import { AuthColor } from './auth-theme';

type Props = { tagline: string };

export function AuthHeader({ tagline }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.appName}>RaceTrack VN</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  appName: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bangers,
    fontSize: 40,
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    color: AuthColor.textMuted,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    marginTop: Spacing.one,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
