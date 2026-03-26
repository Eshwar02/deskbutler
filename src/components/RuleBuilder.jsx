import { useState, useEffect } from "react";
import { getRules, addRule, deleteRule, parseRulePrompt, checkOllamaStatus } from "../utils/tauri";

export default function RuleBuilder() {
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);

  // NLP mode
  const [prompt, setPrompt] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);

  // Manual mode
  const [manualMode, setManualMode] = useState(false);
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [destination, setDestination] = useState("");

  const [ollamaAvailable, setOllamaAvailable] = useState(null);

  const load = async () => {
    try {
      setRules(await getRules());
      setError(null);
    } catch {
      setError("Could not load rules from backend.");
      setRules([]);
    }
  };

  useEffect(() => {
    load();
    checkOllamaStatus()
      .then((s) => setOllamaAvailable(s.running && s.selected_model_available))
      .catch(() => setOllamaAvailable(false));
  }, []);

  const handleParsePrompt = async () => {
    if (!prompt.trim()) return;
    setParsing(true);
    setError(null);
    setParsed(null);
    try {
      const result = await parseRulePrompt(prompt.trim());
      if (result.ok) {
        setParsed(result.rule);
      } else {
        setError(result.error || "Could not parse rule from prompt.");
      }
    } catch {
      setError("Failed to parse rule. Is Ollama running?");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmParsed = async () => {
    if (!parsed) return;
    setError(null);
    try {
      await addRule(parsed.name, parsed.condition, parsed.destination);
      setParsed(null);
      setPrompt("");
      await load();
    } catch {
      setError("Failed to add rule.");
    }
  };

  const handleManualAdd = async () => {
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

  const showManual = manualMode || ollamaAvailable === false;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Rules</h1>
        <p className="subtitle">Tell DeskButler how you like things organized.</p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {!showManual ? (
        <div className="form-stack">
          <div className="input-group">
            <input
              className="input"
              placeholder='Describe your rule, e.g. "move all PDFs to Documents"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleParsePrompt()}
            />
            <button className="btn btn-primary" onClick={handleParsePrompt} disabled={parsing}>
              {parsing ? (
                <><span className="spinner" style={{ width: 14, height: 14 }} /> Parsing</>
              ) : "Parse"}
            </button>
          </div>

          {parsed && (
            <div className="preview-card">
              <div className="preview-title">Parsed Rule</div>
              <div className="input-with-label" style={{ marginBottom: 8 }}>
                <span className="input-label">Name</span>
                <input className="input" value={parsed.name} onChange={(e) => setParsed({ ...parsed, name: e.target.value })} />
              </div>
              <div className="input-with-label" style={{ marginBottom: 8 }}>
                <span className="input-label">Pattern</span>
                <input className="input" value={parsed.condition} onChange={(e) => setParsed({ ...parsed, condition: e.target.value })} />
              </div>
              <div className="input-with-label" style={{ marginBottom: 12 }}>
                <span className="input-label">Destination</span>
                <input className="input" value={parsed.destination} onChange={(e) => setParsed({ ...parsed, destination: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-success" onClick={handleConfirmParsed}>Confirm</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setParsed(null)}>Cancel</button>
              </div>
            </div>
          )}

          <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setManualMode(true)}>
            Manual mode
          </button>
        </div>
      ) : (
        <div className="form-stack">
          <input className="input" placeholder="Rule name, e.g. PDFs to Documents" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="When file matches, e.g. *.pdf" value={condition} onChange={(e) => setCondition(e.target.value)} />
          <input className="input" placeholder="Move to folder, e.g. C:\Documents\PDFs" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={handleManualAdd}>Add Rule</button>
            {ollamaAvailable && (
              <button className="btn btn-ghost btn-sm" onClick={() => setManualMode(false)}>NLP mode</button>
            )}
          </div>
        </div>
      )}

      {rules.length > 0 && (
        <div className="section">
          <p className="section-title">Active Rules</p>
          <ul className="list">
            {rules.map((r) => (
              <li key={r.id} className="list-item">
                <div className="list-item-info">
                  <span className="list-item-title">{r.name}</span>
                  <div className="list-item-meta">{r.condition} → {r.destination}</div>
                </div>
                <div className="list-item-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rules.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <p>No rules yet. Add one above to teach DeskButler your preferences.</p>
        </div>
      )}
    </div>
  );
}
