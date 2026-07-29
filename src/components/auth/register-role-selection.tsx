import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Users } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthColor, withAlpha } from './auth-theme';
import type { RegisterRole } from './types';

type Props = { onSelect: (role: RegisterRole) => void };

export function RegisterRoleSelection({ onSelect }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.section}>
        <Text style={styles.hint}>Chọn loại tài khoản</Text>

        <TouchableOpacity
          style={[styles.card, { borderColor: withAlpha(AuthColor.primary, '40') }]}
          onPress={() => onSelect('jockey')}
          activeOpacity={0.8}>
          <View style={[styles.cardIcon, { backgroundColor: withAlpha(AuthColor.primary, '26') }]}>
            <MaterialCommunityIcons name="horse-human" size={26} color={AuthColor.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: AuthColor.primary }]}>Kỵ sĩ</Text>
            <Text style={styles.cardDesc}>
              Tham gia giải đua, quản lý lịch thi đấu và nhận lời mời
            </Text>
          </View>
          <Text style={styles.cardChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: withAlpha(AuthColor.tertiary, '40') }]}
          onPress={() => onSelect('spectator')}
          activeOpacity={0.8}>
          <View style={[styles.cardIcon, { backgroundColor: withAlpha(AuthColor.tertiary, '26') }]}>
            <Users size={26} color={AuthColor.tertiary} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: AuthColor.tertiary }]}>Khán Giả</Text>
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
  hint:         { color: AuthColor.textMuted, fontFamily: FontFamily.medium, fontSize: 13, letterSpacing: 0.3, marginBottom: Spacing.one },
  card:         { flexDirection: 'row', backgroundColor: AuthColor.fieldFill, borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center', gap: Spacing.two, borderWidth: 1 },
  cardIcon:     { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardText:     { flex: 1, gap: 3 },
  cardTitle:    { fontFamily: FontFamily.bold, fontSize: 16 },
  cardDesc:     { color: AuthColor.textMuted, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17 },
  cardChevron:  { color: AuthColor.textMuted, fontSize: 22 },
});
