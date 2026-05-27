import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import { notifications } from '@/data/mock-data';
import { M3TabBar } from '@/components/m3-tab-bar';

const unreadCount = notifications.filter(n => !n.read).length;

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
      <Tabs.Screen
        name="profile"
        options={{ title: 'Hồ sơ', tabBarIcon: tabIcon('account-circle', 'account-circle-outline') }}
      />
    </Tabs>
  );
}
