import {
  requestNotificationPermission,
  getNotificationPermission,
  rescheduleAllNotifications,
} from '../services/notifications';
import { useState } from 'react';
import ExportImport from '../components/ExportImport';

export default function SettingsScreen() {
  const [permStatus, setPermStatus] = useState(getNotificationPermission());

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermStatus(getNotificationPermission());
    if (granted) {
      await rescheduleAllNotifications();
    }
  };

  return (
    <div className="screen">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Notifications</h3>
        {permStatus === 'unsupported' ? (
          <p>Notifications are not supported in this browser.</p>
        ) : permStatus === 'granted' ? (
          <p className="status-ok">✓ Notifications enabled</p>
        ) : permStatus === 'denied' ? (
          <p className="status-error">
            Notifications are blocked. Please enable them in your browser
            settings.
          </p>
        ) : (
          <button className="btn btn-confirm" onClick={handleEnableNotifications}>
            Enable Notifications
          </button>
        )}
        <p className="settings-hint">
          Reminders fire 15 minutes before each scheduled dose.
        </p>
      </div>

      <div className="settings-section">
        <ExportImport />
      </div>
    </div>
  );
}
