import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (user?.role === 'jockey') {
    return <Redirect href={'/jockey/home' as never} />;
  }

  if (user?.role === 'horse_owner') {
    return <Redirect href={'/owner/home' as never} />;
  }

  if (user?.role === 'spectator') {
    return <Redirect href={'/(app)/home' as never} />;
  }

  return <Redirect href={'/(auth)/auth' as never} />;
}
