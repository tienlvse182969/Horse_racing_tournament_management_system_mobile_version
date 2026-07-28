import { Tabs } from 'expo-router';
import { Home, Mail, Flag, Bell, Trophy } from 'lucide-react-native';
import type { ColorValue } from 'react-native';

import { M3TabBar } from '@/components/m3-tab-bar';
import { useJockeyDashboard, useJockeyInvitations, useJockeyNotifications } from '@/hooks/useJockeyData';

function tabIcon(Icon: React.ComponentType<{ color?: string; size?: number }>) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Icon color={color as string} size={size} />
  );
}

export default function JockeyTabsLayout() {
  // These reuse the same polled resources as the tab screens themselves, so the
  // layout doesn't run its own separate fetch/interval on top of theirs.
  const { invitations } = useJockeyInvitations();
  const { upcomingRaces: upcomingRaceCount } = useJockeyDashboard();
  const { notifications } = useJockeyNotifications();
  const pendingCount = invitations.filter((i) => i.status === 'pending').length;
  const unreadCount = notifications.filter((n) => !n.read).length;

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
        name="assigned"
        options={{
          title: 'Trận đấu',
          tabBarIcon: tabIcon(Flag),
          tabBarBadge: upcomingRaceCount > 0 ? upcomingRaceCount : undefined,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: tabIcon(Bell),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{ title: 'Kết quả', tabBarIcon: tabIcon(Trophy) }}
      />
    </Tabs>
  );
}
