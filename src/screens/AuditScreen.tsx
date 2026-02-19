import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function AuditScreen() {
  const [filterMedicineId, setFilterMedicineId] = useState<number | null>(null);

  const medicines = useLiveQuery(() => db.medicines.toArray());

  const auditEntries = useLiveQuery(() => {
    let query = db.auditTrail.orderBy('recordedAt').reverse();
    if (filterMedicineId !== null) {
      return db.auditTrail
        .where('medicineId')
        .equals(filterMedicineId)
        .reverse()
        .sortBy('recordedAt');
    }
    return query.toArray();
  }, [filterMedicineId]);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
                  {formatDate(entry.recordedAt)}
                </span>
              </div>
              <span
                className={`audit-status ${entry.status === 'TAKEN' ? 'status-taken' : 'status-deleted'}`}
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
