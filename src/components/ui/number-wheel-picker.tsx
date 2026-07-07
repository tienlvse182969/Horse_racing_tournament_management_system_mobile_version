import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, FontFamily } from '@/constants/theme';

type Props = { min: number; max: number; value: number; onChange: (value: number) => void };

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SIDE_PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
// Grace period after the finger lifts to let a following momentum-scroll take over,
// so we don't commit an in-between offset and then yank the view to a final position
// while it's still decelerating (that fight is what makes the wheel feel "stuck").
const DRAG_SETTLE_MS = 80;

export function NumberWheelPicker({ min, max, value, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lastScrolledValue = useRef<number | null>(null);
  const isInteracting = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    const clamped = Math.min(max, Math.max(min, value));
    if (lastScrolledValue.current === clamped) return;
    lastScrolledValue.current = clamped;
    // Never fight an in-progress touch/momentum scroll with a programmatic jump —
    // that's what was making the wheel appear to stop responding.
    if (isInteracting.current) return;
    scrollRef.current?.scrollTo({ y: (clamped - min) * ITEM_HEIGHT, animated: false });
  }, [value, min, max]);

  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);

  const commitOffset = (offsetY: number) => {
    const index = Math.min(numbers.length - 1, Math.max(0, Math.round(offsetY / ITEM_HEIGHT)));
    const picked = min + index;
    lastScrolledValue.current = picked;
    onChange(picked);
  };

  const onScrollBeginDrag = () => {
    isInteracting.current = true;
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    // The finger lifted, but momentum may still be about to kick in — give it a beat
    // before treating this offset as final, so onMomentumScrollEnd (if it fires) wins.
    settleTimer.current = setTimeout(() => {
      isInteracting.current = false;
      commitOffset(offsetY);
    }, DRAG_SETTLE_MS);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    isInteracting.current = false;
    commitOffset(e.nativeEvent.contentOffset.y);
  };

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.highlight} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ paddingVertical: SIDE_PADDING }}
        style={{ height: CONTAINER_HEIGHT }}>
        {numbers.map(n => (
          <View key={n} style={styles.item}>
            <Text style={[styles.itemText, n === value && styles.itemTextSelected]}>{n}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: CONTAINER_HEIGHT, width: 90 },
  highlight: {
    position: 'absolute',
    top: SIDE_PADDING,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: Shape.medium,
    backgroundColor: SC.highest,
  },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  itemText: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 16 },
  itemTextSelected: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 18 },
});
