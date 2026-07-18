import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';

export type RaceCalendarEvent = {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  notes: string;
  durationHours?: number;
};

export type AddToCalendarResult =
  | { ok: true }
  | { ok: false; reason: 'permission' | 'no-writable-calendar' | 'error' };

// Reminders fixed at 1 day and 1 hour before the race, matching product spec.
const REMINDER_OFFSETS_MINUTES = [-24 * 60, -60];

export async function addRaceEventToCalendar(event: RaceCalendarEvent): Promise<AddToCalendarResult> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return { ok: false, reason: 'permission' };

    const [year, month, day] = event.date.split('-').map(Number);
    const [hours, minutes] = event.time.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + (event.durationHours ?? 2) * 60 * 60 * 1000);

    let calendarId: string;
    if (Platform.OS === 'ios') {
      const cal = await Calendar.getDefaultCalendarAsync();
      calendarId = cal.id;
    } else {
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writable = cals.find(c => c.allowsModifications);
      if (!writable) return { ok: false, reason: 'no-writable-calendar' };
      calendarId = writable.id;
    }

    await Calendar.createEventAsync(calendarId, {
      title: event.title,
      startDate,
      endDate,
      location: event.location,
      notes: event.notes,
      timeZone: 'Asia/Ho_Chi_Minh',
      alarms: REMINDER_OFFSETS_MINUTES.map(relativeOffset => ({ relativeOffset })),
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
