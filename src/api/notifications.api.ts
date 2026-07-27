import { Platform } from 'react-native';
import { apiPatch, apiPost, apiRequest } from './client';

export function registerDeviceToken(token: string) {
  return apiPost<void>('/api/notifications/device-token', {
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
  });
}

export function unregisterDeviceToken(token: string) {
  return apiRequest<void>('/api/notifications/device-token', {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  });
}

export function markNotificationRead(id: string) {
  return apiPatch<void>(`/api/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return apiPatch<void>('/api/notifications/read-all');
}
