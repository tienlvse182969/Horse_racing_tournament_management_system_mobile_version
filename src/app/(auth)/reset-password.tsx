import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck } from 'lucide-react-native';

import { Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthColor } from '@/components/auth/auth-theme';
import * as authApi from '@/api/auth.api';
import { ApiError } from '@/api/client';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMessage('');
    setError('');
    if (password.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hai lần nhập mật khẩu chưa khớp.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.resetPassword(token.trim(), password);
      setMessage(result.message);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <View style={styles.alert}>
          <ShieldCheck size={22} color={AuthColor.onPrimary} />
          <Text style={styles.alertText}>MAT KHAU MOI</Text>
        </View>
        <Text style={styles.title}>Tạo mật khẩu mới</Text>
        <Text style={styles.desc}>Nếu mở từ email, token sẽ được điền tự động. Nếu không, hãy copy token trong link reset vào ô bên dưới.</Text>
        <TextInput label="Token đặt lại mật khẩu" value={token} onChangeText={setToken} mode="outlined" autoCapitalize="none" disabled={loading} textColor={AuthColor.text} />
        <TextInput label="Mật khẩu mới" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry disabled={loading} textColor={AuthColor.text} />
        <TextInput label="Nhập lại mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" secureTextEntry disabled={loading} textColor={AuthColor.text} />
        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={AuthColor.onPrimary} /> : <Text style={styles.primaryText}>Đặt lại mật khẩu</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(auth)/auth' as never)}>
          <Text style={styles.backText}>Về màn đăng nhập</Text>
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
