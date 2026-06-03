import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HorseRacingDark as C, Shape, Spacing, FontFamily } from '@/constants/theme';
import type { RegisterRole } from './types';

type Props = {
  registerRole: RegisterRole;
  onChangeRole: () => void;
  name: string;
  email: string;
  password: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
};

export function RegisterForm({
  registerRole,
  onChangeRole,
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
}: Props) {
  const [pwVisible, setPwVisible] = useState(false);

  const isJockey       = registerRole === 'jockey';
  const accentColor    = isJockey ? C.primary : C.tertiary;
  const containerColor = isJockey ? C.primaryContainer : C.tertiaryContainer;
  const inputTheme     = isJockey ? undefined : { colors: { primary: C.tertiary } };

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.form}>
        <View style={styles.roleBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: containerColor }]}>
            <MaterialCommunityIcons
              name={isJockey ? 'horse-variant' : 'account-group-outline'}
              size={16}
              color={accentColor}
            />
            <Text style={[styles.roleBadgeLabel, { color: accentColor }]}>
              {isJockey ? 'Kỵ sĩ' : 'Khán Giả'}
            </Text>
          </View>
          <TouchableOpacity onPress={onChangeRole} style={styles.changeRoleBtn}>
            <Text style={styles.changeRoleText}>Đổi loại tài khoản</Text>
          </TouchableOpacity>
        </View>

        {isJockey && (
          <Text style={styles.notice}>
            Đăng ký kỵ sĩ qua ứng dụng chưa hỗ trợ. Vui lòng liên hệ ban tổ chức hoặc dùng tài khoản demo.
          </Text>
        )}

        <TextInput
          label="Họ và tên"
          value={name}
          onChangeText={onNameChange}
          mode="outlined"
          left={<TextInput.Icon icon="account-outline" />}
          theme={inputTheme}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={onEmailChange}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email-outline" />}
          theme={inputTheme}
        />
        <TextInput
          label="Mật khẩu"
          value={password}
          onChangeText={onPasswordChange}
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
  roleBadgeLabel: { fontFamily: FontFamily.medium, fontSize: 13 },
  changeRoleBtn:  { paddingVertical: 6, paddingHorizontal: Spacing.one },
  changeRoleText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, textDecorationLine: 'underline' },
  notice: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, marginBottom: Spacing.one },
});
