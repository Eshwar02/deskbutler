import { useState, useEffect } from "react";
import { getWatchedFolders, addWatchedFolder, removeWatchedFolder } from "../utils/tauri";

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

  const handleRemove = async (path) => {
    try {
      await removeWatchedFolder(path);
      await load();
    } catch {
      setError("Failed to remove folder.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="page">
      <h1>Watched Folders</h1>
      <p className="subtitle">DeskButler keeps an eye on these folders for you.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="input-row">
        <input
          type="text"
          placeholder="Folder path, e.g. C:\Users\you\Desktop"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={handleAdd} disabled={adding}>
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      <ul className="folder-list">
        {folders.map((f) => (
          <li key={f.path} className="folder-item">
            <span>{f.path}</span>
            <button className="btn btn-small btn-danger" onClick={() => handleRemove(f.path)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {folders.length === 0 && !error && (
        <p className="muted">No folders watched yet. Add one above to get started.</p>
      )}
    </div>
  );
}
