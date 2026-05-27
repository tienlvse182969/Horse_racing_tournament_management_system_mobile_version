import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import type { RegisterRole } from './types';

type Props = {
  registerRole: RegisterRole;
  onChangeRole: () => void;
  onGuestPress: () => void;
};

export function RegisterForm({ registerRole, onChangeRole, onGuestPress }: Props) {
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [license, setLicense]   = useState('');
  const [password, setPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);

  const isJockey       = registerRole === 'jockey';
  const accentColor    = isJockey ? C.primary : C.tertiary;
  const containerColor = isJockey ? C.primaryContainer : C.tertiaryContainer;
  const inputTheme     = isJockey ? undefined : { colors: { primary: C.tertiary } };

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.form}>

        {/* Role badge */}
        <View style={styles.roleBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: containerColor }]}>
            <Text style={styles.roleBadgeEmoji}>{isJockey ? '🏇' : '👥'}</Text>
            <Text style={[styles.roleBadgeLabel, { color: accentColor }]}>
              {isJockey ? 'Kỵ sĩ' : 'Khán Giả'}
            </Text>
          </View>
          <TouchableOpacity onPress={onChangeRole} style={styles.changeRoleBtn}>
            <Text style={styles.changeRoleText}>Đổi loại tài khoản</Text>
          </TouchableOpacity>
        </View>

        {/* Guest shortcut — spectator only */}
        {!isJockey && (
          <>
            <TouchableOpacity style={styles.guestCard} onPress={onGuestPress} activeOpacity={0.8}>
              <View style={[styles.guestIconWrap, { backgroundColor: C.tertiaryContainer }]}>
                <Text style={styles.guestEmoji}>👁️</Text>
              </View>
              <View style={styles.guestTextBlock}>
                <Text style={styles.guestTitle}>Xem không cần đăng nhập</Text>
                <Text style={styles.guestDesc}>Theo dõi kết quả và lịch đua</Text>
              </View>
              <Text style={styles.guestChevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>HOẶC ĐĂNG KÝ</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}

        {/* Form fields */}
        <TextInput
          label="Họ và tên"
          value={name}
          onChangeText={setName}
          mode="outlined"
          left={<TextInput.Icon icon="account-outline" />}
          theme={inputTheme}
        />
        <TextInput
          label="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          left={<TextInput.Icon icon="phone-outline" />}
          theme={inputTheme}
        />
        {isJockey && (
          <TextInput
            label="Số giấy phép kỵ sĩ"
            value={license}
            onChangeText={setLicense}
            mode="outlined"
            left={<TextInput.Icon icon="card-account-details-outline" />}
          />
        )}
        <TextInput
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!pwVisible}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={pwVisible ? 'eye-off-outline' : 'eye-outline'}
              onPress={() => setPwVisible(v => !v)}
            />
          }
          theme={inputTheme}
        />

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.two, marginBottom: Spacing.two },

  roleBadgeRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.one },
  roleBadge:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingVertical: 6, paddingHorizontal: Spacing.two, borderRadius: Shape.full },
  roleBadgeEmoji: { fontSize: 16 },
  roleBadgeLabel: { fontFamily: FontFamily.medium, fontSize: 13 },
  changeRoleBtn:  { paddingVertical: 6, paddingHorizontal: Spacing.one },
  changeRoleText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, textDecorationLine: 'underline' },

  guestCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: `${C.tertiary}18`, borderWidth: 1, borderColor: `${C.tertiary}45`, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.two },
  guestIconWrap:  { width: 38, height: 38, borderRadius: Shape.medium, justifyContent: 'center', alignItems: 'center' },
  guestEmoji:     { fontSize: 18 },
  guestTextBlock: { flex: 1, gap: 2 },
  guestTitle:     { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13 },
  guestDesc:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  guestChevron:   { color: C.onSurfaceVariant, fontSize: 20 },

  dividerRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginVertical: Spacing.two },
  dividerLine:  { flex: 1, height: 1, backgroundColor: C.outlineVariant },
  dividerLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 10, letterSpacing: 1.2 },
});
