import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthTabSwitcher } from '@/components/auth/auth-tab-switcher';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterRoleSelection } from '@/components/auth/register-role-selection';
import { RegisterForm } from '@/components/auth/register-form';
import type { Tab, RegisterRole } from '@/components/auth/types';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import * as authApi from '@/api/auth.api';

const DEMO_PASSWORD = 'Demo@123';

function redirectForRole(role: string) {
  if (role === 'jockey') router.replace('/jockey/home' as never);
  else if (role === 'spectator') router.replace('/(app)/home' as never);
  else router.replace('/(auth)/auth' as never);
}

export default function AuthScreen() {
  const { login, registerSpectator } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [registerRole, setRegisterRole] = useState<RegisterRole | null>(null);
  const [email, setEmail] = useState('spectator@demo.local');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isJockey = registerRole === 'jockey';
  const roleColor = (activeTab === 'login' || isJockey) ? C.primary : C.tertiary;
  const onRoleColor = (activeTab === 'login' || isJockey) ? C.onPrimary : C.onTertiary;

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

  async function handleDemoLogin(demoEmail: string) {
    setLoading(true);
    setError(null);
    try {
      const user = await login(demoEmail, DEMO_PASSWORD);
      redirectForRole(user.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <Animated.View entering={FadeInDown.duration(380)}>
              <Text style={styles.screenTitle}>
                {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(60).duration(380)}>
              <AuthTabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
            </Animated.View>

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
                  ) : (
                    <Text style={[styles.submitText, { color: onRoleColor }]}>
                      {activeTab === 'login'
                        ? 'Đăng nhập'
                        : isJockey ? '🏇 Đăng ký Kỵ sĩ' : '👥 Đăng ký Khán Giả'}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleDemoLogin('spectator@demo.local')}
                disabled={loading}
                activeOpacity={0.8}>
                <Text style={styles.demoText}>👥 Demo Khán giả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoBtn, styles.demoBtnJockey]}
                onPress={() => handleDemoLogin('jockey1@demo.local')}
                disabled={loading}
                activeOpacity={0.8}>
                <Text style={[styles.demoText, styles.demoTextJockey]}>🏇 Demo Kỵ sĩ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: SC.low },
  safeArea:    { flex: 1 },
  flex:        { flex: 1 },
  scroll:      { padding: Spacing.three, paddingBottom: Spacing.five },
  screenTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 28, marginBottom: Spacing.three, marginTop: Spacing.two },
  submitBtn:   { borderRadius: Shape.full, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two, marginBottom: Spacing.two },
  submitText:  { fontFamily: FontFamily.bold, fontSize: 16, letterSpacing: 0.5 },
  errorText:   { color: C.error, fontFamily: FontFamily.medium, fontSize: 13, marginBottom: Spacing.two },
  demoRow:          { flexDirection: 'row', gap: Spacing.two, paddingVertical: Spacing.two },
  demoBtn:          { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Shape.full, borderWidth: 1, borderColor: C.outlineVariant },
  demoBtnJockey:    { borderColor: `${C.primary}60`, backgroundColor: `${C.primary}15` },
  demoText:         { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 13 },
  demoTextJockey:   { color: C.primary },
});
