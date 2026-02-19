import { useState } from 'react';

interface TakeDialogProps {
  medicineName: string;
  scheduledTime: string;
  onConfirm: (actualTime: string) => void;
  onCancel: () => void;
}

export default function TakeDialog({
  medicineName,
  scheduledTime,
  onConfirm,
  onCancel,
}: TakeDialogProps) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [time, setTime] = useState(currentTime);

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Take Medicine</h2>
        <p className="dialog-med-name">{medicineName}</p>
        <p className="dialog-scheduled">Scheduled: {scheduledTime}</p>
        <label className="dialog-label">
          Taken at:
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="dialog-time-input"
          />
        </label>
        <div className="dialog-buttons">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-confirm" onClick={() => onConfirm(time)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
