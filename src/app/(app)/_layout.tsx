import { useEffect, useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { ActivityIndicator, View } from 'react-native';

import { M3TabBar } from '@/components/m3-tab-bar';
import { useAuth } from '@/context/AuthContext';
import { spectatorApi } from '@/api/spectator.api';

function tabIcon(active: string, inactive: string) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <MaterialCommunityIcons
      name={(focused ? active : inactive) as any}
      color={color as string}
      size={size}
    />
  );
}

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'spectator') {
      spectatorApi.listNotifications().then((res) => {
        setUnreadCount(res.notifications.filter((n) => !n.isRead).length);
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

  if (!user || user.role !== 'spectator') {
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
        name="live"
        options={{ title: 'Trực tiếp', tabBarIcon: tabIcon('broadcast', 'broadcast') }}
      />
      <Tabs.Screen
        name="predict"
        options={{ title: 'Dự đoán', tabBarIcon: tabIcon('target', 'target') }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: tabIcon('bell', 'bell-outline'),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tabs>
  );
}
