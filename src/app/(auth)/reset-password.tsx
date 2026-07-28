import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { TextInput } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, KeyRound, Lock, Eye, EyeOff } from 'lucide-react-native';

import { Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthColor } from '@/components/auth/auth-theme';
import { AuthBackdrop } from '@/components/auth/auth-backdrop';
import { AuthHeader } from '@/components/auth/auth-header';
import * as authApi from '@/api/auth.api';
import { ApiError } from '@/api/client';

const inputTheme = {
  colors: {
    primary: AuthColor.primary,
    onSurfaceVariant: AuthColor.textMuted,
    outline: AuthColor.borderStrong,
    onSurface: AuthColor.text,
    background: AuthColor.fieldFill,
    error: AuthColor.error,
  },
};

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const blurTargetRef = useRef<View>(null);
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
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
    <View style={styles.root}>
      <AuthBackdrop blurTargetRef={blurTargetRef} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <Animated.View entering={FadeInDown.duration(420)}>
              <AuthHeader tagline="Bảo mật tài khoản của bạn" />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(80).duration(420)} style={styles.cardWrap}>
              <BlurView
                blurTarget={blurTargetRef}
                intensity={55}
                tint="dark"
                blurMethod="dimezisBlurView"
                style={styles.card}>
                <View style={styles.cardTint} pointerEvents="none" />
                <View style={styles.cardContent}>
                  <View style={styles.alert}>
                    <ShieldCheck size={22} color={AuthColor.onPrimary} />
                    <Text style={styles.alertText}>MẬT KHẨU MỚI</Text>
                  </View>
                  <Text style={styles.title}>Tạo mật khẩu mới</Text>
                  <Text style={styles.desc}>
                    Nếu mở từ email, token sẽ được điền tự động. Nếu không, hãy copy token trong link reset vào ô bên dưới.
                  </Text>
                  <TextInput
                    label="Token đặt lại mật khẩu"
                    value={token}
                    onChangeText={setToken}
                    mode="outlined"
                    autoCapitalize="none"
                    disabled={loading}
                    left={<TextInput.Icon icon={({ size }) => <KeyRound color={AuthColor.textMuted} size={size} />} />}
                    theme={inputTheme}
                    textColor={AuthColor.text}
                  />
                  <TextInput
                    label="Mật khẩu mới"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!pwVisible}
                    disabled={loading}
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
                  <TextInput
                    label="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!confirmVisible}
                    disabled={loading}
                    left={<TextInput.Icon icon={({ size }) => <Lock color={AuthColor.textMuted} size={size} />} />}
                    right={
                      <TextInput.Icon
                        icon={({ size }) =>
                          confirmVisible
                            ? <EyeOff color={AuthColor.textMuted} size={size} />
                            : <Eye color={AuthColor.textMuted} size={size} />
                        }
                        onPress={() => setConfirmVisible(v => !v)}
                      />
                    }
                    theme={inputTheme}
                    textColor={AuthColor.text}
                  />
                  {message ? <Text style={styles.success}>{message}</Text> : null}
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <Animated.View entering={FadeIn.delay(140).duration(380)}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={loading} activeOpacity={0.85}>
                      {loading
                        ? <ActivityIndicator color={AuthColor.onPrimary} />
                        : <Text style={styles.primaryText}>Đặt lại mật khẩu</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                  <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(auth)/auth' as never)}>
                    <Text style={styles.backText}>Về màn đăng nhập</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#000000' },
  safeArea: { flex: 1 },
  flex:     { flex: 1 },
  scroll:   { flexGrow: 1, justifyContent: 'center', padding: Spacing.three, paddingVertical: Spacing.five },

  cardWrap: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  card: {
    borderRadius: Shape.extraLarge,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AuthColor.border,
  },
  cardTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: AuthColor.cardTint },
  cardContent: { padding: Spacing.four, gap: Spacing.three },

  alert: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, paddingVertical: 9, paddingHorizontal: 13, borderRadius: Shape.full, backgroundColor: AuthColor.primary },
  alertText: { color: AuthColor.onPrimary, fontFamily: FontFamily.bold, letterSpacing: 1 },
  title: { color: AuthColor.text, fontFamily: FontFamily.bold, fontSize: 24 },
  desc: { color: AuthColor.textMuted, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21 },
  success: { color: AuthColor.tertiary, fontFamily: FontFamily.medium, fontSize: 13 },
  error: { color: AuthColor.error, fontFamily: FontFamily.medium, fontSize: 13 },
  primaryBtn: { height: 52, borderRadius: Shape.full, alignItems: 'center', justifyContent: 'center', backgroundColor: AuthColor.primary },
  primaryText: { color: AuthColor.onPrimary, fontFamily: FontFamily.bold, fontSize: 16 },
  backBtn: { alignItems: 'center', paddingVertical: Spacing.one },
  backText: { color: AuthColor.primary, fontFamily: FontFamily.bold },
});
