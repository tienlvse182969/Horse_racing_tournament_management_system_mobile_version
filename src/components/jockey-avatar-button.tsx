import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import { Shape, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';

const JOCKEY_AVATAR = require('@/assets/images/jockey_avt.jpg');

export function JockeyAvatarButton() {
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity style={styles.btn} onPress={() => router.push('/jockey-profile')} activeOpacity={0.75}>
      <Image source={JOCKEY_AVATAR} style={styles.avatarImg} contentFit="cover" />
    </TouchableOpacity>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
    btn: {
      width: 34,
      height: 34,
      borderRadius: Shape.full,
      backgroundColor: SC.highest,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
    },
  });
}
