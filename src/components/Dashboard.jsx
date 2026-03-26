import { useState, useEffect } from "react";
import { getSuggestions, checkOllamaStatus, getWatchedFolders, getHistory, getRules, getPaths, notify } from "../utils/tauri";
import SuggestionCard from "./SuggestionCard";

export default function Dashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [folderCount, setFolderCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [ruleCount, setRuleCount] = useState(0);
  const [paths, setPaths] = useState(null);
  const [prevSuggestionIds, setPrevSuggestionIds] = useState(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuggestions();

      const currentIds = new Set(data.map((s) => s.id));
      const newOnes = data.filter((s) => !prevSuggestionIds.has(s.id));
      if (newOnes.length > 0 && prevSuggestionIds.size > 0) {
        notify("DeskButler", `${newOnes.length} new file suggestion${newOnes.length > 1 ? "s" : ""} ready for review.`);
      }
      setPrevSuggestionIds(currentIds);

      setSuggestions(data);
    } catch (e) {
      setError("Could not reach backend. Is the Python server running?");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);

    checkOllamaStatus().then(setOllamaStatus).catch(() => setOllamaStatus(null));
    getWatchedFolders().then((f) => setFolderCount(f.length)).catch(() => {});
    getHistory().then((h) => setHistoryCount(h.length)).catch(() => {});
    getRules().then((r) => setRuleCount(r.length)).catch(() => {});
    getPaths().then(setPaths).catch(() => {});

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back</h1>
        <p className="subtitle">Here's what DeskButler found for you.</p>
      </div>

      <div className="status-row">
        <span className="status-chip">
          <span className="status-dot online" />
          Backend
        </span>
        <span className="status-chip">
          <span className={`status-dot ${ollamaStatus?.running ? "online" : "offline"}`} />
          Ollama {ollamaStatus?.running ? (ollamaStatus.selected_model_available ? "(model ready)" : "(no model)") : "(offline)"}
        </span>
        <span className="status-chip">
          <strong style={{ color: "var(--accent)" }}>{folderCount}</strong>
          {" "}Watched folders
        </span>
      </div>

      <div className="card-grid card-grid-3" style={{ marginBottom: "var(--space-lg)" }}>
        <div className="card stat-card">
          <div className="stat-value">{historyCount}</div>
          <div className="stat-label">Files organized</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{ruleCount}</div>
          <div className="stat-label">Active rules</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{suggestions.length}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {paths && (
        <div className="paths-info">
          Database: {paths.database} | Log: {paths.log_file}
        </div>
      )}

      {error && <div className="banner banner-error">{error}</div>}

      {loading && suggestions.length === 0 ? (
        <div className="section">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      ) : suggestions.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <p>All tidy! No suggestions right now.</p>
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} onAction={load} />
          ))}
        </div>
      )}
    </div>
  );
}
