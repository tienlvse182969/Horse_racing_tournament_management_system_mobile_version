import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import { invitations } from '@/mock-data';
import { M3TabBar } from '@/components/m3-tab-bar';

const pendingCount = invitations.filter(i => i.status === 'pending').length;

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
