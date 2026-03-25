import { useState } from "react";

export default function Settings() {
  const [startOnBoot, setStartOnBoot] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <div className="page">
      <h1>Settings</h1>
      <p className="subtitle">Make DeskButler work your way.</p>

      <div className="settings-group">
        <label className="setting-row">
          <span>Start when computer turns on</span>
          <input type="checkbox" checked={startOnBoot} onChange={(e) => setStartOnBoot(e.target.checked)} />
        </label>

        <label className="setting-row">
          <span>Show notifications for new suggestions</span>
          <input type="checkbox" checked={notificationsOn} onChange={(e) => setNotificationsOn(e.target.checked)} />
        </label>
      </div>
    </div>
  );
}
