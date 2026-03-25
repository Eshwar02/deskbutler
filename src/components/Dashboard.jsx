import { useState, useEffect } from "react";
import { getSuggestions } from "../utils/tauri";
import SuggestionCard from "./SuggestionCard";

export default function Dashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getSuggestions();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <h1>Welcome back</h1>
      <p className="subtitle">Here's what DeskButler found for you.</p>

      {loading ? (
        <p className="muted">Checking your files...</p>
      ) : suggestions.length === 0 ? (
        <div className="empty-state">
          <p>All tidy! No suggestions right now.</p>
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} onAction={load} />
          ))}
        </div>
      )}
    </div>
  );
}
