import { useState, useEffect } from "react";
import { getSuggestions } from "../utils/tauri";
import SuggestionCard from "./SuggestionCard";

export default function Dashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuggestions();
      setSuggestions(data);
    } catch (e) {
      setError("Could not reach backend. Is the Python server running?");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <h1>Welcome back</h1>
      <p className="subtitle">Here's what DeskButler found for you.</p>

      {error && <div className="error-banner">{error}</div>}

      {loading && suggestions.length === 0 ? (
        <p className="muted">Checking your files...</p>
      ) : suggestions.length === 0 && !error ? (
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
