import { Stack } from 'expo-router';

import { useJockeyPenaltyDetail } from '@/hooks/useJockeyData';
import { PenaltyDetail } from '@/components/jockey/penalty-detail';

export default function JockeyPenaltyDetailScreen() {
  const { penalty, loading } = useJockeyPenaltyDetail();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PenaltyDetail penalty={penalty} loading={loading} />
    </>
  );
}
