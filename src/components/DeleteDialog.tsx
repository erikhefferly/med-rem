import { format12Hour } from '../types';

interface DeleteDialogProps {
  medicineName: string;
  scheduledTime: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteDialog({
  medicineName,
  scheduledTime,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Skip Reminder</h2>
        <p className="dialog-med-name">{medicineName}</p>
        <p className="dialog-scheduled">Scheduled: {format12Hour(scheduledTime)}</p>
        <p>Skip this upcoming reminder? It will be logged in your history.</p>
        <div className="dialog-buttons">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-delete" onClick={onConfirm}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
