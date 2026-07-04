import { Stack, useLocalSearchParams } from 'expo-router';
import { TournamentRaces } from '@/components/spectator/tournament-races';

export default function TournamentRacesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TournamentRaces tournamentId={id ?? ''} />
    </>
  );
}
