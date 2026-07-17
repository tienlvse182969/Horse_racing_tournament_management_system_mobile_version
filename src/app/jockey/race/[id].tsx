import { Stack, useLocalSearchParams } from 'expo-router';

import { useJockeyRaceDetail } from '@/hooks/useJockeyData';
import { useAuth } from '@/context/AuthContext';
import { RaceDay } from '@/components/jockey/race-day';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontFamily, Spacing, type AppColors, type SurfaceColors } from '@/constants/theme';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';

export default function JockeyRaceScreen() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { jockeyRace, fullRace } = useJockeyRaceDetail(id ?? '');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {jockeyRace ? (
        <RaceDay
          jockeyRace={jockeyRace}
          fullRace={fullRace}
          jockeyName={user?.fullName ?? 'Nguyễn Minh Tuấn'}
        />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={C.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}
    </>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
    loading:     { flex: 1, backgroundColor: SC.lowest, justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
    loadingText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14 },
  });
}
