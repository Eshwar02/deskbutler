import { approveSuggestion, rejectSuggestion } from "../utils/tauri";

export default function SuggestionCard({ suggestion, onAction }) {
  const handleApprove = async () => {
    await approveSuggestion(suggestion.id);
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
        <span className="path-from">{suggestion.from_path}</span>
        <span className="path-arrow">→</span>
        <span className="path-to">{suggestion.to_path}</span>
      </div>
      <div className="suggestion-actions">
        <button className="btn btn-approve" onClick={handleApprove}>
          Yes, move it
        </button>
        <button className="btn btn-reject" onClick={handleReject}>
          No thanks
        </button>
      </div>
    </div>
  );
}
