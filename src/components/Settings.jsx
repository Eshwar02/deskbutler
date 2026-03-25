import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "../utils/tauri";

export default function Settings() {
  const [startOnBoot, setStartOnBoot] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [ollamaModel, setOllamaModel] = useState("llama3.2");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await getSettings();
        if (s.start_on_boot) setStartOnBoot(s.start_on_boot === "true");
        if (s.notifications) setNotificationsOn(s.notifications === "true");
        if (s.ollama_model) setOllamaModel(s.ollama_model);
      } catch {
        // Use defaults
      }
    })();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await saveSettings({
        start_on_boot: String(startOnBoot),
        notifications: String(notificationsOn),
        ollama_model: ollamaModel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Could not save settings.");
    }
  };

  return (
    <div className="page">
      <h1>Settings</h1>
      <p className="subtitle">Make DeskButler work your way.</p>

      {error && <div className="error-banner">{error}</div>}
      {saved && <div className="success-banner">Settings saved!</div>}

      <div className="settings-group">
        <label className="setting-row">
          <span>Start when computer turns on</span>
          <input type="checkbox" checked={startOnBoot} onChange={(e) => setStartOnBoot(e.target.checked)} />
        </label>

        <label className="setting-row">
          <span>Show notifications for new suggestions</span>
          <input type="checkbox" checked={notificationsOn} onChange={(e) => setNotificationsOn(e.target.checked)} />
        </label>

        <label className="setting-row">
          <span>Ollama model</span>
          <input
            type="text"
            className="setting-input"
            value={ollamaModel}
            onChange={(e) => setOllamaModel(e.target.value)}
          />
        </label>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}
