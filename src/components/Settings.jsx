import { useState, useEffect } from "react";
import { getSettings, saveSettings, checkOllamaStatus, pullOllamaModel, getPaths } from "../utils/tauri";
import { Settings as SettingsIcon, Download, Check, Server, Bell, Power, Database, FileText } from "lucide-react";

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
      {saved && (
        <div className="banner banner-success">
          <Check size={16} />
          Settings saved successfully!
        </div>
      )}

      {/* Ollama Status Card */}
      <div className="settings-section">
        <div className="section-header">
          <Server size={18} />
          <h2>Ollama AI</h2>
        </div>
        <div className="ollama-status-card">
          <div className="status-grid">
            <div className="status-item">
              <div className="status-item-label">
                <span className={`status-dot ${ollamaStatus?.running ? "online" : "offline"}`} />
                Server Status
              </div>
              <div className="status-item-value">
                {ollamaStatus?.running ? "Running" : "Offline"}
              </div>
            </div>

            {ollamaStatus?.running && (
              <>
                <div className="status-item">
                  <div className="status-item-label">
                    <span className={`status-dot ${ollamaStatus.selected_model_available ? "online" : "warning"}`} />
                    Model Status
                  </div>
                  <div className="status-item-value">
                    {ollamaStatus.selected_model_available ? "Available" : "Not Found"}
                  </div>
                </div>

                {ollamaStatus.models?.length > 0 && (
                  <div className="status-item" style={{ gridColumn: "1 / -1" }}>
                    <div className="status-item-label">Installed Models</div>
                    <div className="models-list">
                      {ollamaStatus.models.map((m) => (
                        <span key={m} className="model-badge">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!ollamaStatus.selected_model_available && (
                  <div className="status-item" style={{ gridColumn: "1 / -1" }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={handlePull} 
                      disabled={pulling}
                      style={{ width: "100%" }}
                    >
                      {pulling ? (
                        <>
                          <Download size={16} className="spinning" />
                          Pulling {ollamaModel}...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Pull {ollamaModel}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <div className="section-header">
          <SettingsIcon size={18} />
          <h2>Preferences</h2>
        </div>
        <div className="settings-group">
          <label className="toggle-row">
            <div className="toggle-row-content">
              <Power size={18} style={{ opacity: 0.6 }} />
              <div>
                <div className="toggle-row-title">Start on boot</div>
                <div className="toggle-row-description">Launch DeskButler when your computer starts</div>
              </div>
            </div>
            <div
              className={`toggle-track ${startOnBoot ? "active" : ""}`}
              onClick={() => setStartOnBoot(!startOnBoot)}
            />
          </label>

          <label className="toggle-row">
            <div className="toggle-row-content">
              <Bell size={18} style={{ opacity: 0.6 }} />
              <div>
                <div className="toggle-row-title">Notifications</div>
                <div className="toggle-row-description">Show desktop notifications for file moves</div>
              </div>
            </div>
            <div
              className={`toggle-track ${notificationsOn ? "active" : ""}`}
              onClick={() => setNotificationsOn(!notificationsOn)}
            />
          </label>

          <div className="settings-row">
            <div className="settings-row-content">
              <Server size={18} style={{ opacity: 0.6 }} />
              <div>
                <div className="settings-row-title">Ollama Model</div>
                <div className="settings-row-description">AI model for natural language rule parsing</div>
              </div>
            </div>
            <div style={{ minWidth: "200px" }}>
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
                  placeholder="Model name"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Storage */}
      {paths && (
        <div className="settings-section">
          <div className="section-header">
            <Database size={18} />
            <h2>Data Storage</h2>
          </div>
          <div className="data-paths-card">
            <div className="data-path-item">
              <FileText size={16} style={{ opacity: 0.5 }} />
              <div className="data-path-content">
                <div className="data-path-label">App Data Directory</div>
                <div className="data-path-value" title={paths.app_data_dir}>
                  {paths.app_data_dir}
                </div>
              </div>
            </div>
            <div className="data-path-item">
              <Database size={16} style={{ opacity: 0.5 }} />
              <div className="data-path-content">
                <div className="data-path-label">Database</div>
                <div className="data-path-value" title={paths.database}>
                  {paths.database}
                </div>
              </div>
            </div>
            <div className="data-path-item">
              <FileText size={16} style={{ opacity: 0.5 }} />
              <div className="data-path-content">
                <div className="data-path-label">Log File</div>
                <div className="data-path-value" title={paths.log_file}>
                  {paths.log_file}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save Button */}
      <div className="settings-save-bar">
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          <Check size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
