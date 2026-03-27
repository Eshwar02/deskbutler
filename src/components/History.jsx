import { useState, useEffect } from "react";
import { getHistory, undoMove } from "../utils/tauri";
import { Clock, RotateCcw, FileText, File, Image, Music, Video, Archive, Code, Search } from "lucide-react";

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return <Image size={20} />;
  if (['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext)) return <Music size={20} />;
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv'].includes(ext)) return <Video size={20} />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <Archive size={20} />;
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'rs'].includes(ext)) return <Code size={20} />;
  if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext)) return <FileText size={20} />;
  return <File size={20} />;
};

const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [undoingId, setUndoingId] = useState(null);

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
    setUndoingId(id);
    try {
      await undoMove(id);
      await load();
    } catch {
      setError("Failed to undo move.");
    } finally {
      setUndoingId(null);
    }
  };

  const filteredHistory = history.filter(h => 
    h.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.from_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.to_path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>History</h1>
        <p className="subtitle">Everything DeskButler has moved, with undo.</p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {history.length > 0 && (
        <div className="history-filters">
          <div className="search-box">
            <Search size={16} style={{ opacity: 0.4 }} />
            <input 
              className="search-input"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {filteredHistory.length === 0 && !error ? (
        <div className="empty-state">
          <Clock size={48} style={{ opacity: 0.3, marginBottom: "8px" }} />
          <p style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "4px" }}>
            {searchQuery ? "No matching files" : "Nothing moved yet"}
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
            {searchQuery ? "Try a different search term" : "Files organized by DeskButler will appear here"}
          </p>
        </div>
      ) : (
        <div className="history-timeline">
          {filteredHistory.map((h, i) => (
            <div 
              key={h.id} 
              className={`history-card ${h.undone ? "history-card-undone" : ""}`}
              style={{ 
                animation: `historyCardIn 0.3s ease-out both`,
                animationDelay: `${i * 0.03}s`
              }}
            >
              <div className="history-card-icon">
                {getFileIcon(h.filename)}
              </div>
              <div className="history-card-content">
                <div className="history-card-header">
                  <div className="history-card-filename">{h.filename}</div>
                  <div className="history-card-time">
                    <Clock size={12} style={{ opacity: 0.5 }} />
                    {formatRelativeTime(h.moved_at)}
                  </div>
                </div>
                <div className="history-card-paths">
                  <div className="history-path" title={h.from_path}>
                    {h.from_path}
                  </div>
                  <div className="history-arrow">→</div>
                  <div className="history-path" title={h.to_path}>
                    {h.to_path}
                  </div>
                </div>
              </div>
              <div className="history-card-actions">
                {!h.undone ? (
                  <button 
                    className="btn btn-ghost btn-sm undo-btn" 
                    onClick={() => handleUndo(h.id)}
                    disabled={undoingId === h.id}
                  >
                    <RotateCcw size={14} />
                    {undoingId === h.id ? "Undoing..." : "Undo"}
                  </button>
                ) : (
                  <span className="badge badge-muted">Undone</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
