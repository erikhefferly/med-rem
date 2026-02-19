import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format12Hour } from '../types';

export default function AuditScreen() {
  const [filterMedicineId, setFilterMedicineId] = useState<number | null>(null);

  const medicines = useLiveQuery(() => db.medicines.toArray());

  const auditEntries = useLiveQuery(async () => {
    let entries;
    if (filterMedicineId !== null) {
      entries = await db.auditTrail
        .where('medicineId')
        .equals(filterMedicineId)
        .toArray();
    } else {
      entries = await db.auditTrail.toArray();
    }
    return entries.sort((a, b) => b.recordedAt - a.recordedAt);
  }, [filterMedicineId]);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateOnly = (ts: number) => {
    return new Date(ts).toLocaleString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="screen">
      <h2>History</h2>

      <div className="audit-filter">
        <label>
          Filter by medicine:
          <select
            value={filterMedicineId ?? ''}
            onChange={(e) =>
              setFilterMedicineId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="form-input"
          >
            <option value="">All medicines</option>
            {medicines?.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!auditEntries || auditEntries.length === 0 ? (
        <p className="empty-state">No history yet.</p>
      ) : (
        <ul className="audit-list">
          {auditEntries.map((entry) => (
            <li key={entry.id} className="audit-item">
              <div className="audit-info">
                <span className="audit-name">{entry.medicineName}</span>
                <span className="audit-date">
                  {entry.takeTime
                    ? `${formatDateOnly(entry.recordedAt)}, ${format12Hour(entry.takeTime)}`
                    : formatDate(entry.recordedAt)}
                </span>
              </div>
              <span
                className={`audit-status status-${entry.status.toLowerCase()}`}
              >
                {entry.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
