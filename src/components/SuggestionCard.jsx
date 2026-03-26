import { approveSuggestion, rejectSuggestion, notify } from "../utils/tauri";

export default function SuggestionCard({ suggestion, onAction }) {
  const handleApprove = async () => {
    await approveSuggestion(suggestion.id);
    notify("File Moved", `${suggestion.filename} moved to ${suggestion.to_path}`);
    onAction?.();
  };

  const handleReject = async () => {
    await rejectSuggestion(suggestion.id);
    onAction?.();
  };

  return (
    <div className="suggestion-card">
      <div className="suggestion-file">{suggestion.filename}</div>
      <div className="suggestion-reason">{suggestion.reason}</div>
      <div className="suggestion-paths">
        <span>{suggestion.from_path}</span>
        <span className="path-arrow">&rarr;</span>
        <span>{suggestion.to_path}</span>
      </div>
      <div className="suggestion-actions">
        <button className="btn btn-success" onClick={handleApprove}>
          Move
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleReject}>
          Skip
        </button>
      </div>
    </div>
  );
}
