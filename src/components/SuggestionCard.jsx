import { useState, memo, useCallback } from "react";
import { approveSuggestion, rejectSuggestion, notify } from "../utils/tauri";

function SuggestionCard({ suggestion, onAction }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      await approveSuggestion(suggestion.id);
      notify("File Moved", `${suggestion.filename} moved to ${suggestion.to_path}`);
      onAction?.();
    } catch (error) {
      console.error("Failed to approve suggestion:", error);
      notify("Error", "Failed to move file");
    } finally {
      setLoading(false);
    }
  }, [suggestion.id, suggestion.filename, suggestion.to_path, onAction]);

  const handleReject = useCallback(async () => {
    setLoading(true);
    try {
      await rejectSuggestion(suggestion.id);
      onAction?.();
    } catch (error) {
      console.error("Failed to reject suggestion:", error);
    } finally {
      setLoading(false);
    }
  }, [suggestion.id, onAction]);

  return (
    <div className="suggestion-card premium-card">
      <div className="suggestion-header">
        <div className="suggestion-file">📄 {suggestion.filename}</div>
      </div>
      <div className="suggestion-reason">{suggestion.reason}</div>
      <div className="suggestion-paths">
        <div className="suggestion-path-item">
          <span className="path-label">From:</span>
          <span className="path-value">{suggestion.from_path}</span>
        </div>
        <div className="suggestion-path-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="suggestion-path-item">
          <span className="path-label">To:</span>
          <span className="path-value">{suggestion.to_path}</span>
        </div>
      </div>
      <div className="suggestion-actions">
        <button 
          className="btn btn-success" 
          onClick={handleApprove}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Move File
            </>
          )}
        </button>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={handleReject}
          disabled={loading}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default memo(SuggestionCard);
