import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { refreshUpcomings } from '../services/scheduler';
import { cancelNotificationsForMedicine } from '../services/notifications';

export default function MedicineManagement() {
  const medicines = useLiveQuery(() => db.medicines.toArray());
  const navigate = useNavigate();

  const handleDelete = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `Delete "${name}" and all its scheduled reminders?`
    );
    if (!confirmed) return;

    cancelNotificationsForMedicine(id);
    await db.medicines.delete(id);
    await refreshUpcomings();
  };

  const formatTimes = (t1: string, t2?: string, t3?: string) => {
    return [t1, t2, t3].filter(Boolean).join(', ');
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Manage Medicines</h2>
        <button
          className="btn btn-confirm"
          onClick={() => navigate('/medicines/new')}
        >
          + Add
        </button>
      </div>

      {!medicines || medicines.length === 0 ? (
        <p className="empty-state">
          No medicines yet. Tap "+ Add" to create your first medicine.
        </p>
      ) : (
        <ul className="medicine-list">
          {medicines.map((med) => (
            <li key={med.id} className="medicine-item">
              <div className="medicine-info">
                <span className="medicine-name">{med.name}</span>
                <span className="medicine-times">
                  {formatTimes(med.takeTime1, med.takeTime2, med.takeTime3)}
                </span>
              </div>
              <div className="medicine-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/medicines/${med.id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-delete-small"
                  onClick={() => handleDelete(med.id!, med.name)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
