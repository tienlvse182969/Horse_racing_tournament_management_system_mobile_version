import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import {
  HorseRacingDark as C,
  SurfaceContainers as SC,
  Shape,
  FontFamily,
} from '@/constants/theme';

// ─── Types (mirror of BottomTabBarProps without importing @react-navigation) ──
type IconProps = { focused: boolean; color: string; size: number };
type RouteOptions = {
  title?: string;
  tabBarBadge?: number | string;
  tabBarIcon?: (props: IconProps) => React.ReactNode;
};
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: RouteOptions }>;
  navigation: {
    navigate: (name: string) => void;
    emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PILL_W = 64;
const PILL_H = 32;

// ─── Single tab item ──────────────────────────────────────────────────────────
type TabItemProps = {
  isFocused: boolean;
  label: string;
  options: RouteOptions;
  onPress: () => void;
};

function TabItem({ isFocused, label, options, onPress }: TabItemProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.2, 1]) }],
    opacity:   interpolate(progress.value, [0, 0.4, 1], [0, 0.7, 1]),
  }));

  const badge = options.tabBarBadge;
  const iconColor = isFocused ? C.onTertiaryContainer : C.onSurfaceVariant;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      android_ripple={{ color: `${C.tertiary}22`, radius: 36, borderless: false }}>

      {/* Icon + pill indicator */}
      <View style={styles.iconArea}>
        <Animated.View style={[styles.pill, pillStyle]} />
        <View style={styles.iconLayer}>
          {options.tabBarIcon?.({ focused: isFocused, color: iconColor, size: 22 })}
          {badge != null && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Label */}
      <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>

    </Pressable>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
export function M3TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.title ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            label={label}
            options={options}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: SC.high,
    borderTopWidth: 1,
    borderTopColor: C.outlineVariant,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },

  // Icon zone — same size as pill so indicator fills it perfectly
  iconArea: {
    width: PILL_W,
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: PILL_W,
    height: PILL_H,
    borderRadius: Shape.full,
    backgroundColor: C.tertiaryContainer,
  },
  iconLayer: {
    width: 22,
    height: 22,
    zIndex: 1,
  },

  // Badge (notification dot) — positioned relative to the 22×22 icon
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 16,
    height: 16,
    borderRadius: Shape.full,
    backgroundColor: C.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    zIndex: 2,
  },
  badgeText: { color: C.onError, fontFamily: FontFamily.bold, fontSize: 9 },

  // Labels
  label:       { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 10, textAlign: 'center' },
  labelActive: { color: C.tertiary, fontFamily: FontFamily.bold },
});
