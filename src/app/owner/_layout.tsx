import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function OwnerLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user || user.role !== 'horse_owner') {
    return <Redirect href={'/(auth)/auth' as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
