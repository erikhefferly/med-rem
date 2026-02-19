import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { refreshUpcomings, markTaken, markDeleted } from '../services/scheduler';
import type { Upcoming } from '../types';
import TakeDialog from '../components/TakeDialog';
import DeleteDialog from '../components/DeleteDialog';

export default function MainScreen() {
  const upcomings = useLiveQuery(() =>
    db.upcomings.orderBy('takeTimestamp').toArray()
  );

  const [takeTarget, setTakeTarget] = useState<Upcoming | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Upcoming | null>(null);

  const refresh = useCallback(() => {
    refreshUpcomings();
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleTakeConfirm = async (actualTime: string) => {
    if (!takeTarget) return;
    await markTaken(takeTarget, actualTime);
    setTakeTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await markDeleted(deleteTarget);
    setDeleteTarget(null);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayLabel = d.toLocaleDateString();
    if (d.toDateString() === today.toDateString()) dayLabel = 'Today';
    else if (d.toDateString() === tomorrow.toDateString()) dayLabel = 'Tomorrow';

    return `${dayLabel} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const isOverdue = (ts: number) => ts < Date.now();

  return (
    <div className="screen">
      <h2>Upcoming Medicines</h2>
      {!upcomings || upcomings.length === 0 ? (
        <p className="empty-state">
          No upcoming medicines. Add medicines from the Manage Medicines screen.
        </p>
      ) : (
        <ul className="upcoming-list">
          {upcomings.map((item) => (
            <li
              key={item.id}
              className={`upcoming-item ${isOverdue(item.takeTimestamp) ? 'overdue' : ''}`}
            >
              <div className="upcoming-info">
                <span className="upcoming-name">{item.medicineName}</span>
                <span className="upcoming-time">
                  {formatTimestamp(item.takeTimestamp)}
                </span>
              </div>
              <div className="upcoming-actions">
                <button
                  className="btn btn-take"
                  onClick={() => setTakeTarget(item)}
                >
                  Take
                </button>
                <button
                  className="btn btn-delete-small"
                  onClick={() => setDeleteTarget(item)}
                >
                  Skip
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {takeTarget && (
        <TakeDialog
          medicineName={takeTarget.medicineName}
          scheduledTime={takeTarget.takeTime}
          onConfirm={handleTakeConfirm}
          onCancel={() => setTakeTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          medicineName={deleteTarget.medicineName}
          scheduledTime={deleteTarget.takeTime}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
