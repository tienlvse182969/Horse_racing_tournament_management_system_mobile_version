import { useRef, useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import type { Tab } from './types';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function AuthTabSwitcher({ activeTab, onTabChange }: Props) {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const containerWRef    = useRef(0);
  const containerWShared = useSharedValue(0);
  const pillOffset       = useSharedValue(0);

  const pillStyle = useAnimatedStyle(() => {
    const pillW = Math.max(0, (containerWShared.value - 8) / 2);
    return {
      width: pillW,
      transform: [{ translateX: withTiming(pillOffset.value, { duration: 240, easing: Easing.out(Easing.cubic) }) }],
    };
  });

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    containerWRef.current = w;
    containerWShared.value = w;
  }, [containerWShared]);

  const handlePress = useCallback((tab: Tab) => {
    const pillW = Math.max(0, (containerWRef.current - 8) / 2);
    pillOffset.value = tab === 'login' ? 0 : pillW;
    onTabChange(tab);
  }, [pillOffset, onTabChange]);

  return (
    <Animated.View style={styles.tabContainer} onLayout={handleLayout}>
      <Animated.View style={[styles.activePill, { backgroundColor: C.primary }, pillStyle]} />
      <TouchableOpacity style={styles.tabItem} onPress={() => handlePress('login')}>
        <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
          Đăng nhập
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabItem} onPress={() => handlePress('register')}>
        <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
          Đăng ký
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: SC.base,
    borderRadius: Shape.full,
    padding: 4,
    position: 'relative',
    height: 48,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  activePill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: Shape.full,
  },
  tabItem: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText:       { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 14 },
  tabTextActive: { color: C.onPrimary },
  });
}
