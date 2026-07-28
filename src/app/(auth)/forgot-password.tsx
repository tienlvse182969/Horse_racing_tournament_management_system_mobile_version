import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MailWarning } from 'lucide-react-native';

import { Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthColor } from '@/components/auth/auth-theme';
import * as authApi from '@/api/auth.api';
import { ApiError } from '@/api/client';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim());
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể gửi email đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <View style={styles.alert}>
          <MailWarning size={22} color={AuthColor.onPrimary} />
          <Text style={styles.alertText}>ĐẶT LẠI MẬT KHẨU</Text>
        </View>
        <Text style={styles.title}>Kiểm tra email của bạn</Text>
        <Text style={styles.desc}>Nhập email tài khoản, hệ thống sẽ gửi link tạo mật khẩu mới. Link có hiệu lực trong thời gian giới hạn.</Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
          textColor={AuthColor.text}
          theme={{ colors: { primary: AuthColor.primary, background: AuthColor.fieldFill, onSurface: AuthColor.text } }}
        />
        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={AuthColor.onPrimary} /> : <Text style={styles.primaryText}>Gửi link đặt lại</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: Spacing.three, backgroundColor: '#170d07' },
  card: { gap: Spacing.three, padding: Spacing.four, borderRadius: Shape.extraLarge, backgroundColor: '#fff8f4', borderWidth: 3, borderColor: AuthColor.primary },
  alert: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, paddingVertical: 9, paddingHorizontal: 13, borderRadius: Shape.full, backgroundColor: AuthColor.primary },
  alertText: { color: AuthColor.onPrimary, fontFamily: FontFamily.bold, letterSpacing: 1 },
  title: { color: AuthColor.text, fontFamily: FontFamily.bold, fontSize: 24 },
  desc: { color: AuthColor.textMuted, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21 },
  success: { color: '#0f6b3c', backgroundColor: '#d4f5e4', borderRadius: Shape.medium, padding: Spacing.two, fontFamily: FontFamily.bold },
  error: { color: AuthColor.error, backgroundColor: '#ffdad6', borderRadius: Shape.medium, padding: Spacing.two, fontFamily: FontFamily.medium },
  primaryBtn: { height: 52, borderRadius: Shape.full, alignItems: 'center', justifyContent: 'center', backgroundColor: AuthColor.primary },
  primaryText: { color: AuthColor.onPrimary, fontFamily: FontFamily.bold, fontSize: 16 },
  backBtn: { alignItems: 'center', paddingVertical: Spacing.one },
  backText: { color: AuthColor.primary, fontFamily: FontFamily.bold },
});
