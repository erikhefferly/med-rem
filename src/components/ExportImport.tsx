import { useRef } from 'react';
import { db } from '../db';
import type { ExportData } from '../types';
import { refreshUpcomings } from '../services/scheduler';
import { rescheduleAllNotifications } from '../services/notifications';

export default function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const medicines = await db.medicines.toArray();
    const auditTrail = await db.auditTrail.toArray();

    const data: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      medicines,
      auditTrail,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicine-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    let data: ExportData;
    try {
      data = JSON.parse(text) as ExportData;
    } catch {
      alert('Invalid file format.');
      return;
    }

    if (data.version !== 1 || !Array.isArray(data.medicines)) {
      alert('Unrecognized backup format.');
      return;
    }

    const confirmed = window.confirm(
      'This will replace all your current data. Continue?'
    );
    if (!confirmed) return;

    await db.transaction(
      'rw',
      db.medicines,
      db.upcomings,
      db.auditTrail,
      async () => {
        await db.medicines.clear();
        await db.upcomings.clear();
        await db.auditTrail.clear();

        // Strip IDs so Dexie auto-generates new ones
        for (const med of data.medicines) {
          delete med.id;
          await db.medicines.add(med);
        }
        for (const entry of data.auditTrail) {
          delete entry.id;
          await db.auditTrail.add(entry);
        }
      }
    );

    await refreshUpcomings();
    await rescheduleAllNotifications();
    alert('Data restored successfully!');

    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="export-import">
      <h3>Backup & Restore</h3>
      <div className="export-import-buttons">
        <button className="btn btn-confirm" onClick={handleExport}>
          Export Data
        </button>
        <label className="btn btn-secondary file-label">
          Import Data
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            hidden
          />
        </label>
      </div>
    </div>
  );
}
