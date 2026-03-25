import { useState, useEffect } from "react";
import { getRules, addRule, deleteRule } from "../utils/tauri";

export default function RuleBuilder() {
  const [rules, setRules] = useState([]);
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setRules(await getRules());
      setError(null);
    } catch {
      setError("Could not load rules from backend.");
      setRules([]);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!name.trim() || !condition.trim() || !destination.trim()) return;
    setError(null);
    try {
      await addRule(name.trim(), condition.trim(), destination.trim());
      setName("");
      setCondition("");
      setDestination("");
      await load();
    } catch {
      setError("Failed to add rule.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRule(id);
      await load();
    } catch {
      setError("Failed to delete rule.");
    }
  };

  return (
    <div className="page">
      <h1>Rules</h1>
      <p className="subtitle">Tell DeskButler how you like things organized.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="rule-form">
        <input placeholder="Rule name, e.g. PDFs to Documents" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="When file matches, e.g. *.pdf" value={condition} onChange={(e) => setCondition(e.target.value)} />
        <input placeholder="Move to folder, e.g. C:\Documents\PDFs" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <button className="btn btn-primary" onClick={handleAdd}>Add Rule</button>
      </div>

      <ul className="rule-list">
        {rules.map((r) => (
          <li key={r.id} className="rule-item">
            <div>
              <strong>{r.name}</strong>
              <span className="muted"> — {r.condition} → {r.destination}</span>
            </div>
            <button className="btn btn-small btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {rules.length === 0 && !error && (
        <p className="muted">No rules yet. Add one above to teach DeskButler your preferences.</p>
      )}
    </div>
  );
}
