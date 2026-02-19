import { db } from '../db';
import { format12Hour } from '../types';

const NOTIFICATION_TAG_PREFIX = 'med-reminder-';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function scheduleNotificationsForMedicine(
  medicineId: number,
  medicineName: string,
  times: string[],
  daysAhead: number = 20
): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Cancel existing notifications for this medicine
  cancelNotificationsForMedicine(medicineId);

  const now = Date.now();
  const fifteenMin = 15 * 60 * 1000;

  for (let day = 0; day < daysAhead; day++) {
    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const d = new Date();
      d.setDate(d.getDate() + day);
      d.setHours(hours!, minutes!, 0, 0);

      const notifyAt = d.getTime() - fifteenMin;
      if (notifyAt <= now) continue;

      const delay = notifyAt - now;

      const tag = `${NOTIFICATION_TAG_PREFIX}${medicineId}-${day}-${time}`;

      // Store timeout ID so we can cancel later
      const timeoutId = window.setTimeout(() => {
        new Notification('Medicine Reminder', {
          body: `Time to take ${medicineName} (scheduled for ${format12Hour(time)})`,
          tag,
          icon: '/pwa-192x192.svg',
          requireInteraction: true,
        });
      }, delay);

      storeTimeoutId(medicineId, timeoutId);
    }
  }
}

// In-memory map of scheduled timeout IDs per medicine
const scheduledTimeouts = new Map<number, number[]>();

function storeTimeoutId(medicineId: number, timeoutId: number): void {
  const existing = scheduledTimeouts.get(medicineId) ?? [];
  existing.push(timeoutId);
  scheduledTimeouts.set(medicineId, existing);
}

export function cancelNotificationsForMedicine(medicineId: number): void {
  const timeouts = scheduledTimeouts.get(medicineId);
  if (timeouts) {
    for (const id of timeouts) {
      window.clearTimeout(id);
    }
    scheduledTimeouts.delete(medicineId);
  }
}

export function cancelAllNotifications(): void {
  for (const [, timeouts] of scheduledTimeouts) {
    for (const id of timeouts) {
      window.clearTimeout(id);
    }
  }
  scheduledTimeouts.clear();
}

export async function rescheduleAllNotifications(): Promise<void> {
  cancelAllNotifications();

  const medicines = await db.medicines.toArray();
  for (const med of medicines) {
    const times = [med.takeTime1, med.takeTime2, med.takeTime3].filter(
      (t): t is string => !!t
    );
    await scheduleNotificationsForMedicine(med.id!, med.name, times);
  }
}
