import { useState, useEffect } from "react";
import { getHistory, undoMove } from "../utils/tauri";

export default function History() {
  const [history, setHistory] = useState([]);

  const load = async () => {
    try {
      setHistory(await getHistory());
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUndo = async (id) => {
    await undoMove(id);
    load();
  };

  return (
    <div className="page">
      <h1>History</h1>
      <p className="subtitle">Everything DeskButler has moved, with undo.</p>

      {history.length === 0 ? (
        <p className="muted">Nothing moved yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((h) => (
            <li key={h.id} className={"history-item" + (h.undone ? " undone" : "")}>
              <div className="history-info">
                <strong>{h.filename}</strong>
                <span className="muted"> — {h.moved_at}</span>
                <div className="history-paths">
                  {h.from_path} → {h.to_path}
                </div>
              </div>
              {!h.undone && (
                <button className="btn btn-small" onClick={() => handleUndo(h.id)}>Undo</button>
              )}
              {h.undone && <span className="badge-undone">Undone</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
