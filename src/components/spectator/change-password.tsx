import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { ApiError } from '@/api/client';
import * as authApi from '@/api/auth.api';

export function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPwVisible, setOldPwVisible] = useState(false);
  const [newPwVisible, setNewPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường');
      return;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Đổi mật khẩu"
          contentContainerStyle={styles.scroll}
          leftAction={
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color={C.onSurface} />
            </TouchableOpacity>
          }>

          <Animated.View entering={FadeIn.duration(220)} style={styles.form}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TextInput
              label="Mật khẩu hiện tại"
              value={oldPassword}
              onChangeText={setOldPassword}
              mode="outlined"
              secureTextEntry={!oldPwVisible}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={oldPwVisible ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setOldPwVisible(v => !v)}
                />
              }
            />
            <TextInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry={!newPwVisible}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={newPwVisible ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setNewPwVisible(v => !v)}
                />
              }
            />
            <TextInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!confirmPwVisible}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={confirmPwVisible ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setConfirmPwVisible(v => !v)}
                />
              }
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={C.onPrimary} />
              ) : (
                <Text style={styles.submitText}>Đổi mật khẩu</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, paddingBottom: Spacing.five },

  form:      { gap: Spacing.two },
  errorText: { color: C.error, fontFamily: FontFamily.medium, fontSize: 13, marginBottom: Spacing.one },

  submitBtn:  { backgroundColor: C.primary, borderRadius: Shape.full, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two },
  submitText: { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 16, letterSpacing: 0.5 },

  backBtn: {
    width: 34, height: 34, borderRadius: Shape.full,
    backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center',
  },
});
