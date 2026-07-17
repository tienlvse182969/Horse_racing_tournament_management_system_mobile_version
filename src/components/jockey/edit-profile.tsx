import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { ApiError } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';

export function EditProfile() {
  const { user, updateProfile } = useAuth();
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công', [
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
          title="Chỉnh sửa hồ sơ"
          contentContainerStyle={styles.scroll}
          leftAction={
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color={C.onSurface} />
            </TouchableOpacity>
          }>

          <Animated.View entering={FadeIn.duration(220)} style={styles.form}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TextInput
              label="Họ tên"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              left={<TextInput.Icon icon="account-outline" />}
            />
            <TextInput
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone-outline" />}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={C.onPrimary} />
              ) : (
                <Text style={styles.submitText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
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
}
