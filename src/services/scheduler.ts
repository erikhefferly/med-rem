import { db } from '../db';
import type { Upcoming } from '../types';

function todayAt(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(hours!, minutes!, 0, 0);
  return d.getTime();
}

function tomorrowAt(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hours!, minutes!, 0, 0);
  return d.getTime();
}

export async function refreshUpcomings(): Promise<void> {
  const medicines = await db.medicines.toArray();
  const now = Date.now();
  const upcomings: Omit<Upcoming, 'id'>[] = [];

  for (const med of medicines) {
    const times = [med.takeTime1, med.takeTime2, med.takeTime3].filter(
      (t): t is string => !!t
    );

    for (const t of times) {
      let ts = todayAt(t);
      // If the time already passed today, schedule for tomorrow
      if (ts < now) {
        ts = tomorrowAt(t);
      }
      upcomings.push({
        medicineId: med.id!,
        medicineName: med.name,
        takeTime: t,
        takeTimestamp: ts,
      });
    }
  }

  await db.transaction('rw', db.upcomings, async () => {
    await db.upcomings.clear();
    await db.upcomings.bulkAdd(upcomings);
  });
}

export async function markTaken(
  upcoming: Upcoming,
  actualTime: string,
  takenTimestamp?: number
): Promise<void> {
  await db.transaction('rw', db.upcomings, db.auditTrail, async () => {
    await db.auditTrail.add({
      medicineId: upcoming.medicineId,
      medicineName: upcoming.medicineName,
      takeTime: actualTime,
      takeTimestamp: takenTimestamp ?? upcoming.takeTimestamp,
      status: 'TAKEN',
      recordedAt: Date.now(),
    });
    await db.upcomings.delete(upcoming.id!);
  });
}

export async function markDeleted(upcoming: Upcoming): Promise<void> {
  await db.transaction('rw', db.upcomings, db.auditTrail, async () => {
    await db.auditTrail.add({
      medicineId: upcoming.medicineId,
      medicineName: upcoming.medicineName,
      takeTime: upcoming.takeTime,
      takeTimestamp: upcoming.takeTimestamp,
      status: 'SKIPPED',
      recordedAt: Date.now(),
    });
    await db.upcomings.delete(upcoming.id!);
  });
}
