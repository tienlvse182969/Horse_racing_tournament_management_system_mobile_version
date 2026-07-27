import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView, BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Zap, Users } from 'lucide-react-native';
import { Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthColor } from '@/components/auth/auth-theme';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthTabSwitcher } from '@/components/auth/auth-tab-switcher';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterRoleSelection } from '@/components/auth/register-role-selection';
import { RegisterForm } from '@/components/auth/register-form';
import type { Tab, RegisterRole } from '@/components/auth/types';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import * as authApi from '@/api/auth.api';
import { APP_VERSION } from '@/constants/version';

const AUTH_BG = require('@/assets/images/authen.jpg');

function redirectForRole(role: string) {
  if (role === 'jockey') router.replace('/jockey/home' as never);
  else if (role === 'spectator') router.replace('/(app)/home' as never);
  else router.replace('/(auth)/auth' as never);
}

export default function AuthScreen() {
  const { login, registerSpectator } = useAuth();
  const blurTargetRef = useRef<View>(null);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [registerRole, setRegisterRole] = useState<RegisterRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isJockey = registerRole === 'jockey';
  const roleColor = (activeTab === 'login' || isJockey) ? AuthColor.primary : AuthColor.tertiary;
  const onRoleColor = (activeTab === 'login' || isJockey) ? AuthColor.onPrimary : AuthColor.onTertiary;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'login') setRegisterRole(null);
  };

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (activeTab === 'login') {
        const user = await login(email.trim(), password);
        if (user.role !== 'spectator' && user.role !== 'jockey') {
          await authApi.logout();
          setError('Ứng dụng chỉ hỗ trợ khán giả và kỵ sĩ.');
          return;
        }
        redirectForRole(user.role);
        return;
      }

      if (registerRole === 'jockey') {
        setError('Đăng ký kỵ sĩ chưa hỗ trợ. Dùng tài khoản demo jockey1@demo.local');
        return;
      }

      const user = await registerSpectator(regEmail.trim(), regPassword, name.trim());
      redirectForRole(user.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
        <Image source={AUTH_BG} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(8,6,3,0.55)', 'rgba(8,6,3,0.35)', 'rgba(8,6,3,0.8)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </BlurTargetView>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <Animated.View entering={FadeInDown.duration(420)}>
              <AuthHeader
                tagline={activeTab === 'login' ? 'Chào mừng trở lại đường đua' : 'Tham gia cộng đồng đua ngựa'}
              />
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
                  <AuthTabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  {activeTab === 'login' && (
                    <LoginForm
                      email={email}
                      password={password}
                      onEmailChange={setEmail}
                      onPasswordChange={setPassword}
                    />
                  )}

                  {activeTab === 'register' && registerRole === null && (
                    <RegisterRoleSelection onSelect={setRegisterRole} />
                  )}

                  {activeTab === 'register' && registerRole !== null && (
                    <RegisterForm
                      registerRole={registerRole}
                      onChangeRole={() => setRegisterRole(null)}
                      name={name}
                      email={regEmail}
                      password={regPassword}
                      onNameChange={setName}
                      onEmailChange={setRegEmail}
                      onPasswordChange={setRegPassword}
                    />
                  )}

                  {(activeTab === 'login' || registerRole !== null) && (
                    <Animated.View entering={FadeIn.delay(140).duration(380)}>
                      <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: roleColor }]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}>
                        {loading ? (
                          <ActivityIndicator color={onRoleColor} />
                        ) : activeTab === 'login' ? (
                          <Text style={[styles.submitText, { color: onRoleColor }]}>Đăng nhập</Text>
                        ) : (
                          <View style={styles.submitInner}>
                            {isJockey
                              ? <Zap size={16} color={onRoleColor} />
                              : <Users size={16} color={onRoleColor} />}
                            <Text style={[styles.submitText, { color: onRoleColor }]}>
                              {isJockey ? 'Đăng ký Kỵ sĩ' : 'Đăng ký Khán Giả'}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              </BlurView>
            </Animated.View>

            <Text style={styles.versionText}>Phiên bản {APP_VERSION}</Text>
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
  cardContent: { padding: Spacing.four },

  submitBtn:   { borderRadius: Shape.full, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two },
  submitInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText:  { fontFamily: FontFamily.bold, fontSize: 16, letterSpacing: 0.5 },
  errorText:   { color: AuthColor.error, fontFamily: FontFamily.medium, fontSize: 13, marginBottom: Spacing.two },
  versionText: { color: AuthColor.textFaint, fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', marginTop: Spacing.four },
});
