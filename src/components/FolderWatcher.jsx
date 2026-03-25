import { useState, useEffect } from "react";
import { getWatchedFolders, addWatchedFolder, removeWatchedFolder } from "../utils/tauri";

export default function FolderWatcher() {
  const [folders, setFolders] = useState([]);
  const [newPath, setNewPath] = useState("");

  const load = async () => {
    try {
      setFolders(await getWatchedFolders());
    } catch {
      setFolders([]);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    await addWatchedFolder(newPath.trim());
    setNewPath("");
    load();
  };

  const handleRemove = async (path) => {
    await removeWatchedFolder(path);
    load();
  };

  return (
    <div className="page">
      <h1>Watched Folders</h1>
      <p className="subtitle">DeskButler keeps an eye on these folders for you.</p>

      <div className="input-row">
        <input
          type="text"
          placeholder="Folder path, e.g. C:\Users\you\Desktop"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAdd}>Add</button>
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

      {folders.length === 0 && (
        <p className="muted">No folders watched yet. Add one above to get started.</p>
      )}
    </div>
  );
}
