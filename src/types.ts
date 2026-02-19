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
  status: 'TAKEN' | 'SKIPPED';
  recordedAt: number; // epoch ms
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  medicines: Medicine[];
  auditTrail: AuditEntry[];
}
