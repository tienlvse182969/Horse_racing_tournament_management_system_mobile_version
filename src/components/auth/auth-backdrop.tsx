import { RefObject } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const AUTH_BG = require('@/assets/images/authen.jpg');

type Props = { blurTargetRef: RefObject<View | null> };

// Shared full-bleed photo + gradient backdrop for the auth flow (login/register,
// forgot-password, reset-password) so every screen sits on the same glass-on-photo look.
export function AuthBackdrop({ blurTargetRef }: Props) {
  return (
    <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
      <Image source={AUTH_BG} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(8,6,3,0.55)', 'rgba(8,6,3,0.35)', 'rgba(8,6,3,0.8)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </BlurTargetView>
  );
}
