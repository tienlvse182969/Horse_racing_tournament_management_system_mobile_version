import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

import { Shape } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-theme';

interface BackButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Canonical back button used across every screen: a circular chip with the
// ArrowLeft glyph, so the shape/size/icon can't drift between screens.
export function BackButton({ onPress, style }: BackButtonProps) {
  const { C, SC } = useAppColors();
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      style={[styles.backBtn, { backgroundColor: SC.highest }, style]}
      activeOpacity={0.7}>
      <ArrowLeft size={22} color={C.onSurface} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: Shape.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
