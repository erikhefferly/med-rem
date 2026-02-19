import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db';
import { refreshUpcomings } from '../services/scheduler';
import { scheduleNotificationsForMedicine } from '../services/notifications';

export default function MedicineForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const [name, setName] = useState('');
  const [takeTime1, setTakeTime1] = useState('08:00');
  const [takeTime2, setTakeTime2] = useState('');
  const [takeTime3, setTakeTime3] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      db.medicines.get(Number(id)).then((med) => {
        if (med) {
          setName(med.name);
          setTakeTime1(med.takeTime1);
          setTakeTime2(med.takeTime2 ?? '');
          setTakeTime3(med.takeTime3 ?? '');
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !takeTime1) return;

    const data = {
      name: name.trim(),
      takeTime1,
      takeTime2: takeTime2 || undefined,
      takeTime3: takeTime3 || undefined,
    };

    let medId: number;
    if (isEdit && id) {
      medId = Number(id);
      await db.medicines.update(medId, data);
    } else {
      medId = await db.medicines.add(data);
    }

    await refreshUpcomings();

    // Schedule notifications
    const times = [data.takeTime1, data.takeTime2, data.takeTime3].filter(
      (t): t is string => !!t
    );
    await scheduleNotificationsForMedicine(medId, data.name, times);

    navigate('/medicines');
  };

  if (loading) return <div className="screen"><p>Loading...</p></div>;

  return (
    <div className="screen">
      <h2>{isEdit ? 'Edit Medicine' : 'Add Medicine'}</h2>
      <form onSubmit={handleSubmit} className="medicine-form">
        <label className="form-label">
          Medicine Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aspirin"
            required
            className="form-input"
            maxLength={100}
          />
        </label>

        <label className="form-label">
          Time 1 (required)
          <input
            type="time"
            value={takeTime1}
            onChange={(e) => setTakeTime1(e.target.value)}
            required
            className="form-input"
          />
        </label>

        <label className="form-label">
          Time 2 (optional)
          <input
            type="time"
            value={takeTime2}
            onChange={(e) => setTakeTime2(e.target.value)}
            className="form-input"
          />
        </label>

        <label className="form-label">
          Time 3 (optional)
          <input
            type="time"
            value={takeTime3}
            onChange={(e) => setTakeTime3(e.target.value)}
            className="form-input"
          />
        </label>

        <div className="form-buttons">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate('/medicines')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-confirm">
            {isEdit ? 'Save' : 'Add Medicine'}
          </button>
        </div>
      </form>
    </div>
  );
}
