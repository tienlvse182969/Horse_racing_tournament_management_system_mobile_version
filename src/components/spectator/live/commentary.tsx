import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';

type Props = { lines: string[] };

export function Commentary({ lines }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [lines.length]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageCircle size={12} color={C.secondary} />
        <Text style={styles.headerText}>BÌNH LUẬN</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        {lines.map((line, i) => (
          <Animated.View key={i} entering={FadeInLeft.duration(300)} style={styles.lineWrap}>
            <Text style={styles.line}>{line}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    backgroundColor: SC.base,
    borderRadius: Shape.medium,
    padding: Spacing.two,
    maxHeight: 72,
  },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  headerText: { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 9, letterSpacing: 0.8 },
  scroll:     { flex: 1 },
  lineWrap:   { marginBottom: 2 },
  line:       { color: C.onSurface, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 18 },
});
