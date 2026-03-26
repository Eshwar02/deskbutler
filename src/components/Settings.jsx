import { useState, useEffect } from "react";
import { getSettings, saveSettings, checkOllamaStatus, pullOllamaModel, getPaths } from "../utils/tauri";

export default function Settings() {
  const [startOnBoot, setStartOnBoot] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [ollamaModel, setOllamaModel] = useState("llama3.2");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [pulling, setPulling] = useState(false);
  const [paths, setPaths] = useState(null);

  const loadOllamaStatus = () => {
    checkOllamaStatus().then(setOllamaStatus).catch(() => setOllamaStatus(null));
  };

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
    loadOllamaStatus();
    getPaths().then(setPaths).catch(() => {});
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
      loadOllamaStatus();
    } catch {
      setError("Could not save settings.");
    }
  };

  const handlePull = async () => {
    setPulling(true);
    setError(null);
    try {
      await pullOllamaModel(ollamaModel);
      loadOllamaStatus();
    } catch {
      setError("Failed to pull model. Is Ollama running?");
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="subtitle">Make DeskButler work your way.</p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {saved && <div className="banner banner-success">Settings saved!</div>}

      <div className="section">
        <p className="section-title">Ollama</p>
        <div className="card card-compact" style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span className={`status-dot ${ollamaStatus?.running ? "online" : "offline"}`} />
            <span>{ollamaStatus?.running ? "Running" : "Offline"}</span>
          </div>
          {ollamaStatus?.running && (
            <>
              <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`status-dot ${ollamaStatus.selected_model_available ? "online" : "warning"}`} />
                <span>
                  Model "{ollamaModel}" {ollamaStatus.selected_model_available ? "available" : "not found"}
                </span>
              </div>
              {ollamaStatus.models?.length > 0 && (
                <div style={{ fontSize: "0.82rem", opacity: 0.6, marginBottom: 8 }}>
                  Installed: {ollamaStatus.models.join(", ")}
                </div>
              )}
              {!ollamaStatus.selected_model_available && (
                <button className="btn btn-primary btn-sm" onClick={handlePull} disabled={pulling}>
                  {pulling ? "Pulling..." : `Pull ${ollamaModel}`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="section">
        <p className="section-title">Preferences</p>
        <div className="settings-group">
          <label className="toggle-row">
            <span>Start on boot</span>
            <div
              className={`toggle-track ${startOnBoot ? "active" : ""}`}
              onClick={() => setStartOnBoot(!startOnBoot)}
            />
          </label>

          <label className="toggle-row">
            <span>Notifications</span>
            <div
              className={`toggle-track ${notificationsOn ? "active" : ""}`}
              onClick={() => setNotificationsOn(!notificationsOn)}
            />
          </label>

          <label className="toggle-row">
            <span>Ollama model</span>
            {ollamaStatus?.running && ollamaStatus.models?.length > 0 ? (
              <select
                className="select"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
              >
                {ollamaStatus.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {!ollamaStatus.models.includes(ollamaModel) && (
                  <option value={ollamaModel}>{ollamaModel} (not installed)</option>
                )}
              </select>
            ) : (
              <input
                type="text"
                className="input"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
              />
            )}
          </label>
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave}>
        Save Settings
      </button>

      {paths && (
        <div className="section">
          <p className="section-title">Data Storage</p>
          <div className="card card-compact" style={{ maxWidth: 520 }}>
            <div className="paths-info">
              <div>
                <span className="label">App data directory</span>
                <span className="value">{paths.app_data_dir}</span>
              </div>
              <div>
                <span className="label">Database</span>
                <span className="value">{paths.database}</span>
              </div>
              <div>
                <span className="label">Log file</span>
                <span className="value">{paths.log_file}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
