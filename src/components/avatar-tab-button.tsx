import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';

import { Shape, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';

export function AvatarTabButton() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity style={styles.btn} onPress={() => router.push('/profile')} activeOpacity={0.75}>
      <User size={18} color={C.tertiary} />
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
    },
  });
}
