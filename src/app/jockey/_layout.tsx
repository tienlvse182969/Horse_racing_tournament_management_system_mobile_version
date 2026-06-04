import { useEffect, useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Home, Mail, Calendar, Trophy } from 'lucide-react-native';
import type { ColorValue } from 'react-native';
import { ActivityIndicator, View } from 'react-native';

import { M3TabBar } from '@/components/m3-tab-bar';
import { useAuth } from '@/context/AuthContext';
import { jockeyApi } from '@/api/jockey.api';

function tabIcon(Icon: React.ComponentType<{ color?: string; size?: number }>) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Icon color={color as string} size={size} />
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
        options={{ title: 'Trang chủ', tabBarIcon: tabIcon(Home) }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: 'Lời mời',
          tabBarIcon: tabIcon(Mail),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{ title: 'Lịch đua', tabBarIcon: tabIcon(Calendar) }}
      />
      <Tabs.Screen
        name="results"
        options={{ title: 'Kết quả', tabBarIcon: tabIcon(Trophy) }}
      />
    </Tabs>
  );
}
