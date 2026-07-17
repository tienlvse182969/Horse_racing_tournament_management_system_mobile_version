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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Zap, Users } from 'lucide-react-native';
import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
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

function redirectForRole(role: string) {
  if (role === 'jockey') router.replace('/jockey/home' as never);
  else if (role === 'spectator') router.replace('/(app)/home' as never);
  else router.replace('/(auth)/auth' as never);
}

export default function AuthScreen() {
  const { login, registerSpectator } = useAuth();
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
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

  return (
    <View style={styles.container}>
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

            <Text style={styles.versionText}>Phiên bản {APP_VERSION}</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
  container:   { flex: 1, backgroundColor: SC.low },
  safeArea:    { flex: 1 },
  flex:        { flex: 1 },
  scroll:      { padding: Spacing.three, paddingBottom: Spacing.five },
  screenTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 28, marginBottom: Spacing.three, marginTop: Spacing.two },
  submitBtn:   { borderRadius: Shape.full, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two, marginBottom: Spacing.two },
  submitInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText:  { fontFamily: FontFamily.bold, fontSize: 16, letterSpacing: 0.5 },
  errorText:   { color: C.error, fontFamily: FontFamily.medium, fontSize: 13, marginBottom: Spacing.two },
  versionText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', marginTop: Spacing.two },
  });
}
