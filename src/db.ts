import Dexie, { type Table } from 'dexie';
import type { Medicine, Upcoming, AuditEntry } from './types';

class MedicineDB extends Dexie {
  medicines!: Table<Medicine, number>;
  upcomings!: Table<Upcoming, number>;
  auditTrail!: Table<AuditEntry, number>;

  constructor() {
    super('MedicineReminderDB');
    this.version(1).stores({
      medicines: '++id, name',
      upcomings: '++id, medicineId, takeTimestamp',
      auditTrail: '++id, medicineId, status, recordedAt',
    });
  }
}

export const db = new MedicineDB();
