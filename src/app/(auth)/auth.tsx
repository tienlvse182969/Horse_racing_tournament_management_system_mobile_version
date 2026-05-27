import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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

export default function AuthScreen() {
  const [activeTab, setActiveTab]       = useState<Tab>('login');
  const [registerRole, setRegisterRole] = useState<RegisterRole | null>(null);

  const isJockey    = registerRole === 'jockey';
  const roleColor   = (activeTab === 'login' || isJockey) ? C.primary   : C.tertiary;
  const onRoleColor = (activeTab === 'login' || isJockey) ? C.onPrimary : C.onTertiary;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'login') setRegisterRole(null);
  };

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

            {activeTab === 'login' && <LoginForm />}

            {activeTab === 'register' && registerRole === null && (
              <RegisterRoleSelection onSelect={setRegisterRole} />
            )}

            {activeTab === 'register' && registerRole !== null && (
              <RegisterForm
                registerRole={registerRole}
                onChangeRole={() => setRegisterRole(null)}
                onGuestPress={() => router.replace('/home' as never)}
              />
            )}

            {(activeTab === 'login' || registerRole !== null) && (
              <Animated.View entering={FadeIn.delay(140).duration(380)}>
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: roleColor }]}
                  onPress={() => router.replace('/home' as never)}
                  activeOpacity={0.85}>
                  <Text style={[styles.submitText, { color: onRoleColor }]}>
                    {activeTab === 'login'
                      ? 'Đăng nhập'
                      : isJockey ? '🏇 Đăng ký Kỵ sĩ' : '👥 Đăng ký Khán Giả'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => router.replace('/home' as never)}>
              <Text style={styles.skipText}>Bỏ qua (Demo) →</Text>
            </TouchableOpacity>

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
  skipBtn:     { alignItems: 'center', paddingVertical: Spacing.two },
  skipText:    { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14 },
});
