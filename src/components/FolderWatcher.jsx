import { useState, useEffect } from "react";
import { getWatchedFolders, addWatchedFolder, removeWatchedFolder, isTauri } from "../utils/tauri";

export default function FolderWatcher() {
  const [folders, setFolders] = useState([]);
  const [newPath, setNewPath] = useState("");
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      setFolders(await getWatchedFolders());
      setError(null);
    } catch {
      setError("Could not load folders from backend.");
      setFolders([]);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addWatchedFolder(newPath.trim());
      setNewPath("");
      await load();
    } catch (e) {
      setError(e.message || "Failed to add folder.");
    } finally {
      setAdding(false);
    }
  };

  const handleBrowse = async () => {
    try {
      const { open } = await import("@tauri-apps/api/dialog");
      const selected = await open({ directory: true, multiple: false, title: "Choose a folder to watch" });
      if (selected) setNewPath(selected);
    } catch { /* dialog not available */ }
  };

  const handleRemove = async (path) => {
    try {
      await removeWatchedFolder(path);
      await load();
    } catch {
      setError("Failed to remove folder.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Watched Folders</h1>
        <p className="subtitle">DeskButler keeps an eye on these folders for you.</p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      <div className="input-group" style={{ marginBottom: "var(--space-lg)", maxWidth: 600 }}>
        <input
          className="input"
          placeholder="Folder path, e.g. C:\Users\you\Desktop"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        {isTauri() && (
          <button className="btn btn-secondary" onClick={handleBrowse}>Browse</button>
        )}
        <button className="btn btn-primary" onClick={handleAdd} disabled={adding}>
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {folders.length > 0 ? (
        <ul className="list">
          {folders.map((f) => (
            <li key={f.path} className="list-item">
              <div className="list-item-info">
                <span className="list-item-title">{f.path}</span>
              </div>
              <div className="list-item-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(f.path)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      ) : !error && (
        <div className="empty-state">
          <div className="empty-state-icon">◫</div>
          <p>No folders watched yet. Add one above to get started.</p>
        </div>
      )}
    </div>
  );
}
