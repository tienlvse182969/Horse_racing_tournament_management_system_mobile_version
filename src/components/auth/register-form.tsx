import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, Zap, Users, User, Mail, Phone, Lock, Eye, EyeOff, FileText, X } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

import { Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthColor, withAlpha } from './auth-theme';
import type { RegisterRole } from './types';

type Props = {
  registerRole: RegisterRole;
  onChangeRole: () => void;
  name: string;
  email: string;
  phone: string;
  password: string;
  licenseDocument: DocumentPicker.DocumentPickerAsset | null;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onLicenseDocumentChange: (doc: DocumentPicker.DocumentPickerAsset | null) => void;
};

export function RegisterForm({
  registerRole,
  onChangeRole,
  name,
  email,
  phone,
  password,
  licenseDocument,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onLicenseDocumentChange,
}: Props) {
  const [pwVisible, setPwVisible] = useState(false);

  const isJockey = registerRole === 'jockey';
  const isOwner = registerRole === 'horse_owner';

  async function handlePickDocument() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (asset.size && asset.size > 10 * 1024 * 1024) {
      Alert.alert('Tệp quá lớn', 'Vui lòng chọn file PDF dưới 10MB.');
      return;
    }
    onLicenseDocumentChange(asset);
  }

  const accentColor = isJockey || isOwner ? AuthColor.primary : AuthColor.tertiary;
  const badgeFill = withAlpha(isJockey || isOwner ? AuthColor.primary : AuthColor.tertiary, '26');
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
              : isOwner
                ? <ShieldCheck size={16} color={accentColor} />
              : <Users size={16} color={accentColor} />}
            <Text style={[styles.roleBadgeLabel, { color: accentColor }]}>
              {isJockey ? 'Nài ngựa' : isOwner ? 'Chủ Ngựa' : 'Khán Giả'}
            </Text>
          </View>
          <TouchableOpacity onPress={onChangeRole} style={styles.changeRoleBtn}>
            <Text style={styles.changeRoleText}>Đổi loại tài khoản</Text>
          </TouchableOpacity>
        </View>

        {(isJockey || isOwner) && (
          <Text style={styles.notice}>
            Hồ sơ của bạn sẽ được ban tổ chức xét duyệt trước khi tài khoản được kích hoạt.
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
          label="Số điện thoại"
          value={phone}
          onChangeText={onPhoneChange}
          mode="outlined"
          keyboardType="phone-pad"
          left={<TextInput.Icon icon={({ size }) => <Phone color={AuthColor.textMuted} size={size} />} />}
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

        {(isJockey || isOwner) && (
          <View>
            <Text style={styles.fieldLabel}>
              {isJockey ? 'Hồ sơ/chứng chỉ nài ngựa (PDF)' : 'Hồ sơ Chủ ngựa (PDF)'}
            </Text>
            {licenseDocument ? (
              <View style={styles.fileRow}>
                <FileText size={18} color={accentColor} />
                <Text style={styles.fileName} numberOfLines={1}>{licenseDocument.name}</Text>
                <TouchableOpacity onPress={() => onLicenseDocumentChange(null)} hitSlop={8}>
                  <X size={16} color={AuthColor.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={handlePickDocument} activeOpacity={0.85}>
                <FileText size={18} color={accentColor} />
                <Text style={[styles.uploadText, { color: accentColor }]}>Chọn file PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  fieldLabel: { color: AuthColor.textMuted, fontFamily: FontFamily.regular, fontSize: 13, marginBottom: 6 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AuthColor.borderStrong,
    borderRadius: Shape.medium,
    paddingVertical: 12,
    paddingHorizontal: Spacing.two,
  },
  uploadText: { fontFamily: FontFamily.medium, fontSize: 14 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: AuthColor.borderStrong,
    borderRadius: Shape.medium,
    paddingVertical: 10,
    paddingHorizontal: Spacing.two,
    backgroundColor: AuthColor.fieldFill,
  },
  fileName: { flex: 1, color: AuthColor.text, fontFamily: FontFamily.regular, fontSize: 13 },
});
