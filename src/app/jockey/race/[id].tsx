import { Stack, useLocalSearchParams } from 'expo-router';

import { useJockeyRaceDetail } from '@/hooks/useJockeyData';
import { useAuth } from '@/context/AuthContext';
import { RaceDay } from '@/components/jockey/race-day';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { HorseRacingDark as C, SurfaceContainers as SC, FontFamily, Spacing } from '@/constants/theme';

export default function JockeyRaceScreen() {
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

const styles = StyleSheet.create({
  loading:     { flex: 1, backgroundColor: SC.lowest, justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
  loadingText: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 14 },
});
