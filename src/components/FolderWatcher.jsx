import { useState, useEffect } from "react";
import { getWatchedFolders, addWatchedFolder, removeWatchedFolder, isTauri } from "../utils/tauri";
import { Folder, FolderOpen, Plus, X, Eye, EyeOff, Upload } from "lucide-react";

export default function FolderWatcher() {
  const [folders, setFolders] = useState([]);
  const [newPath, setNewPath] = useState("");
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [removingId, setRemovingId] = useState(null);

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
    setRemovingId(path);
    try {
      await removeWatchedFolder(path);
      await load();
    } catch {
      setError("Failed to remove folder.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const path = files[0].path;
      if (path) setNewPath(path);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Watched Folders</h1>
          <p className="subtitle">DeskButler keeps an eye on these folders for you.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleBrowse}
          style={{ gap: "6px" }}
        >
          <Plus size={16} />
          Add Folder
        </button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {/* Drag & Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? "drop-zone-active" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ marginBottom: "var(--space-lg)" }}
      >
        <Upload size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
          Drag a folder here or paste a path below
        </p>
        <div className="input-group" style={{ width: "100%", maxWidth: "600px" }}>
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
      </div>

      {folders.length > 0 ? (
        <div className="folder-grid">
          {folders.map((f, i) => (
            <div 
              key={f.path} 
              className="folder-card"
              style={{ 
                animation: `folderCardIn 0.3s ease-out both`,
                animationDelay: `${i * 0.05}s`
              }}
            >
              <div className="folder-card-icon">
                <FolderOpen size={24} style={{ color: "var(--accent)" }} />
              </div>
              <div className="folder-card-content">
                <div className="folder-card-path" title={f.path}>
                  {f.path}
                </div>
                <div className="folder-card-status">
                  <Eye size={14} style={{ opacity: 0.6 }} />
                  <span>Watching</span>
                </div>
              </div>
              <div className="folder-card-actions">
                <button 
                  className="btn-icon-small" 
                  onClick={() => handleRemove(f.path)}
                  disabled={removingId === f.path}
                  title="Remove folder"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !error && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Folder size={48} style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "4px" }}>
            No folders watched yet
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
            Add a folder above to start organizing files automatically
          </p>
        </div>
      )}
    </div>
  );
}
