export interface Medicine {
  id?: number;
  name: string;
  takeTime1: string; // HH:MM format
  takeTime2?: string;
  takeTime3?: string;
}

export interface Upcoming {
  id?: number;
  medicineId: number;
  medicineName: string;
  takeTime: string; // HH:MM
  takeTimestamp: number; // epoch ms for sorting
}

export interface AuditEntry {
  id?: number;
  medicineId: number;
  medicineName: string;
  takeTime: string;
  takeTimestamp: number;
  status: 'TAKEN' | 'SKIPPED' | 'ADDED' | 'REMOVED';
  recordedAt: number; // epoch ms
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  medicines: Medicine[];
  auditTrail: AuditEntry[];
}

export function format12Hour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h! >= 12 ? 'PM' : 'AM';
  const hour12 = h! % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
