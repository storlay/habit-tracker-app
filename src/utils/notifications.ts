import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Habit } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
}

let channelReady: Promise<void> | null = null;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Напоминания о привычках',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).then(() => undefined);
  }
  await channelReady;
}

export async function scheduleForHabit(habit: Habit): Promise<string[]> {
  if (!habit.reminder || habit.reminder.days.length === 0) return [];
  await ensureAndroidChannel();
  const { hour, minute, days } = habit.reminder;
  return Promise.all(
    days.map((day) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: habit.title,
          body: 'Время отметить привычку',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1,
          hour,
          minute,
          channelId: Platform.OS === 'android' ? 'habit-reminders' : undefined,
        },
      }),
    ),
  );
}

export async function cancelIds(ids: string[] | undefined): Promise<void> {
  if (!ids || ids.length === 0) return;
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}
