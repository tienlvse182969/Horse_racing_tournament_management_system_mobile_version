import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import type { RegisterRole } from './types';

type Props = { onSelect: (role: RegisterRole) => void };

export function RegisterRoleSelection({ onSelect }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.section}>
        <Text style={styles.hint}>Chọn loại tài khoản</Text>

        <TouchableOpacity
          style={[styles.card, { borderColor: `${C.primary}40` }]}
          onPress={() => onSelect('jockey')}
          activeOpacity={0.8}>
          <View style={[styles.cardIcon, { backgroundColor: C.primaryContainer }]}>
            <Text style={styles.cardEmoji}>🏇</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: C.primary }]}>Kỵ sĩ</Text>
            <Text style={styles.cardDesc}>
              Tham gia giải đua, quản lý lịch thi đấu và nhận lời mời
            </Text>
          </View>
          <Text style={styles.cardChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: `${C.tertiary}40` }]}
          onPress={() => onSelect('spectator')}
          activeOpacity={0.8}>
          <View style={[styles.cardIcon, { backgroundColor: C.tertiaryContainer }]}>
            <Text style={styles.cardEmoji}>👥</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: C.tertiary }]}>Khán Giả</Text>
            <Text style={styles.cardDesc}>
              Theo dõi trực tiếp, đặt cược và nhận thưởng hấp dẫn
            </Text>
          </View>
          <Text style={styles.cardChevron}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section:      { gap: Spacing.two, marginBottom: Spacing.two },
  hint:         { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 13, letterSpacing: 0.3, marginBottom: Spacing.one },
  card:         { flexDirection: 'row', backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: Spacing.two, borderWidth: 1 },
  cardIcon:     { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardEmoji:    { fontSize: 24 },
  cardText:     { flex: 1, gap: 3 },
  cardTitle:    { fontFamily: FontFamily.bold, fontSize: 16 },
  cardDesc:     { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17 },
  cardChevron:  { color: C.onSurfaceVariant, fontSize: 22 },
});
