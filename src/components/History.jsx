import { useState, useEffect } from "react";
import { getHistory, undoMove } from "../utils/tauri";

export default function History() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setHistory(await getHistory());
      setError(null);
    } catch {
      setError("Could not load history from backend.");
      setHistory([]);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUndo = async (id) => {
    try {
      await undoMove(id);
      await load();
    } catch {
      setError("Failed to undo move.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>History</h1>
        <p className="subtitle">Everything DeskButler has moved, with undo.</p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {history.length === 0 && !error ? (
        <div className="empty-state">
          <span style={{ fontSize: "2rem" }}>📋</span>
          <p>Nothing moved yet.</p>
        </div>
      ) : (
        <ul className="list">
          {history.map((h) => (
            <li key={h.id} className={`list-item ${h.undone ? "undone" : ""}`}>
              <div className="list-item-info">
                <span className="list-item-title">{h.filename}</span>
                <div className="list-item-meta">
                  {h.from_path} → {h.to_path}
                </div>
                <span className="badge badge-muted">{h.moved_at}</span>
              </div>
              <div className="list-item-actions">
                {!h.undone ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleUndo(h.id)}>
                    Undo
                  </button>
                ) : (
                  <span className="badge badge-muted">Undone</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
