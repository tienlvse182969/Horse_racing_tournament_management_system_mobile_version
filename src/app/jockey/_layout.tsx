import { useEffect, useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { ActivityIndicator, View } from 'react-native';

import { M3TabBar } from '@/components/m3-tab-bar';
import { useAuth } from '@/context/AuthContext';
import { jockeyApi } from '@/api/jockey.api';

function tabIcon(active: string, inactive: string) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <MaterialCommunityIcons
      name={(focused ? active : inactive) as any}
      color={color as string}
      size={size}
    />
  );
}

export default function JockeyLayout() {
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'jockey') {
      jockeyApi.listInvitations('pending').then((res) => {
        setPendingCount(res.invitations.length);
      }).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user || user.role !== 'jockey') {
    return <Redirect href={'/(auth)/auth' as never} />;
  }

  return (
    <Tabs
      tabBar={props => <M3TabBar {...(props as any)} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: 'Lời mời',
          tabBarIcon: tabIcon('email', 'email-outline'),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{ title: 'Lịch đua', tabBarIcon: tabIcon('calendar-month', 'calendar-month-outline') }}
      />
      <Tabs.Screen
        name="results"
        options={{ title: 'Kết quả', tabBarIcon: tabIcon('trophy', 'trophy-outline') }}
      />
    </Tabs>
  );
}
