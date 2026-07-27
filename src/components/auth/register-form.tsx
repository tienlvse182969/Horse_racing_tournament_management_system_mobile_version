import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Zap, Users, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthColor, withAlpha } from './auth-theme';
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

  const isJockey    = registerRole === 'jockey';
  const accentColor = isJockey ? AuthColor.primary : AuthColor.tertiary;
  const badgeFill    = withAlpha(isJockey ? AuthColor.primary : AuthColor.tertiary, '26');
  const inputTheme = {
    colors: {
      primary: accentColor,
      onSurfaceVariant: AuthColor.textMuted,
      outline: AuthColor.borderStrong,
      onSurface: AuthColor.text,
      background: AuthColor.fieldFill,
      error: AuthColor.error,
    },
  };

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.form}>
        <View style={styles.roleBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: badgeFill }]}>
            {isJockey
              ? <Zap size={16} color={accentColor} />
              : <Users size={16} color={accentColor} />}
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
          left={<TextInput.Icon icon={({ size }) => <User color={AuthColor.textMuted} size={size} />} />}
          theme={inputTheme}
          textColor={AuthColor.text}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={onEmailChange}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon={({ size }) => <Mail color={AuthColor.textMuted} size={size} />} />}
          theme={inputTheme}
          textColor={AuthColor.text}
        />
        <TextInput
          label="Mật khẩu"
          value={password}
          onChangeText={onPasswordChange}
          mode="outlined"
          secureTextEntry={!pwVisible}
          left={<TextInput.Icon icon={({ size }) => <Lock color={AuthColor.textMuted} size={size} />} />}
          right={
            <TextInput.Icon
              icon={({ size }) =>
                pwVisible
                  ? <EyeOff color={AuthColor.textMuted} size={size} />
                  : <Eye color={AuthColor.textMuted} size={size} />
              }
              onPress={() => setPwVisible(v => !v)}
            />
          }
          theme={inputTheme}
          textColor={AuthColor.text}
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
  changeRoleText: { color: AuthColor.textMuted, fontFamily: FontFamily.regular, fontSize: 13, textDecorationLine: 'underline' },
  notice: { color: AuthColor.textMuted, fontFamily: FontFamily.regular, fontSize: 13, marginBottom: Spacing.one },
});
