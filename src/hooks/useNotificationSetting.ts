import { useCallback, useEffect, useState } from 'react';
import * as notificationsApi from '@/api/notifications.api';
import {
  clearStoredPushToken,
  getStoredPushToken,
  isPushNotificationsEnabled,
  registerForPushNotificationsAsync,
  setPushNotificationsEnabled,
} from '@/lib/push-notifications';

export function useNotificationSetting() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isPushNotificationsEnabled()
      .then(setEnabled)
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    await setPushNotificationsEnabled(next);

    if (next) {
      const token = await registerForPushNotificationsAsync();
      if (token) await notificationsApi.registerDeviceToken(token);
      return;
    }

    const token = await getStoredPushToken();
    if (token) {
      await notificationsApi.unregisterDeviceToken(token).catch(() => {});
      await clearStoredPushToken().catch(() => {});
    }
  }, [enabled]);

  return { enabled, loading, toggle };
}
