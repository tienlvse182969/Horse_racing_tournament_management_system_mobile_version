import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, FontFamily, Spacing } from '@/constants/theme';

// Large title scrolls with content → compact header fades in when title scrolls out of view
const LARGE_TITLE_H = 88;   // approx height of large title section
const FADE_START    = LARGE_TITLE_H * 0.35;
const FADE_END      = LARGE_TITLE_H * 0.75;

type Props = {
  title: string;
  bangers?: boolean;
  contentContainerStyle?: ViewStyle;
  children: React.ReactNode;
};

export function LargeHeaderScrollView({ title, bangers = false, contentContainerStyle, children }: Props) {
  const scrollY = useSharedValue(0);

  const handler = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y;
  });

  // Large title fades out as user scrolls
  const largeTitleAnim = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, FADE_START], [1, 0], 'clamp'),
    transform: [{
      translateY: interpolate(scrollY.value, [0, FADE_END], [0, -10], 'clamp'),
    }],
  }));

  // Compact header fades in as large title leaves view
  const compactAnim = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [FADE_START, FADE_END], [0, 1], 'clamp'),
    transform: [{
      translateY: interpolate(scrollY.value, [FADE_START, FADE_END], [-6, 0], 'clamp'),
    }],
  }));

  return (
    <View style={styles.root}>
      {/* Compact header — overlays at top, invisible when title visible */}
      <Animated.View style={[styles.compactHeader, compactAnim]} pointerEvents="none">
        <Text style={bangers ? styles.compactBangers : styles.compactTitle} numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>

      {/* Scrollable area — large title is its first child */}
      <Animated.ScrollView
        onScroll={handler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}>

        <Animated.View style={largeTitleAnim}>
          <Text style={bangers ? styles.largeBangers : styles.largeTitle}>
            {title}
          </Text>
        </Animated.View>

        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Compact header (fixed overlay, appears on scroll)
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: SC.lowest,
    borderBottomWidth: 1,
    borderBottomColor: `${C.outlineVariant}60`,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  compactTitle: {
    color: C.onSurface,
    fontFamily: FontFamily.bold,
    fontSize: 17,
  },
  compactBangers: {
    color: C.primary,
    fontFamily: FontFamily.bangers,
    fontSize: 22,
    letterSpacing: 2,
  },

  // Large title (scrolls with content)
  largeTitle: {
    color: C.onSurface,
    fontFamily: FontFamily.bold,
    fontSize: 34,
    letterSpacing: -0.5,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.two,
  },
  largeBangers: {
    color: C.primary,
    fontFamily: FontFamily.bangers,
    fontSize: 40,
    letterSpacing: 3,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.two,
  },
});
