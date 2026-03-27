import { useState, useEffect } from "react";
import { getRules, addRule, deleteRule, parseRulePrompt, checkOllamaStatus } from "../utils/tauri";
import { Sparkles, GripVertical, Trash2, Edit3, ArrowRight, Plus, Loader } from "lucide-react";

export default function RuleBuilder() {
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
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
      {success && <div className="banner banner-success">Rule created successfully! ✨</div>}

      <div className="rule-builder-layout">
        {/* Left: Rules List */}
        <div className="rules-list-panel">
          <div className="panel-header">
            <h3>Active Rules</h3>
            <span className="badge">{rules.length}</span>
          </div>

          {rules.length > 0 ? (
            <div className="rules-grid">
              {rules.map((r, i) => (
                <div 
                  key={r.id} 
                  className="rule-glass-card"
                  style={{ 
                    animation: `ruleCardIn 0.3s ease-out both`,
                    animationDelay: `${i * 0.05}s`
                  }}
                >
                  <div className="rule-card-header">
                    <div className="rule-drag-handle" title="Drag to reorder">
                      <GripVertical size={16} style={{ opacity: 0.3 }} />
                    </div>
                    <div className="rule-card-title">{r.name}</div>
                    <div className="rule-card-actions">
                      <button 
                        className="btn-icon-small" 
                        onClick={() => handleDelete(r.id)}
                        title="Delete rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="rule-card-condition">
                    <code>{r.condition}</code>
                  </div>
                  <div className="rule-card-arrow">
                    <ArrowRight size={14} style={{ opacity: 0.4 }} />
                  </div>
                  <div className="rule-card-destination">
                    {r.destination}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-mini">
              <Sparkles size={32} style={{ opacity: 0.2, marginBottom: "8px" }} />
              <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
                No rules yet. Create one to get started.
              </p>
            </div>
          )}
        </div>

        {/* Right: Create Form */}
        <div className="rule-create-panel">
          <div className="panel-header">
            <h3>{showManual ? "Manual Entry" : "AI Parser"}</h3>
            {ollamaAvailable && (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setManualMode(!manualMode)}
              >
                {showManual ? "AI Mode" : "Manual"}
              </button>
            )}
          </div>

          {!showManual ? (
            <div className="create-form">
              <div className="ai-input-group">
                <Sparkles size={18} style={{ color: "var(--accent)", opacity: 0.8 }} />
                <input
                  className="input-ai"
                  placeholder='e.g. "Move all PDFs to Documents folder"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleParsePrompt()}
                  disabled={parsing}
                />
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleParsePrompt} 
                disabled={parsing || !prompt.trim()}
                style={{ width: "100%" }}
              >
                {parsing ? (
                  <>
                    <Loader size={16} className="spinning" />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Parse Rule
                  </>
                )}
              </button>

              {parsed && (
                <div className="parsed-preview">
                  <div className="preview-header">
                    <span>Parsed Rule</span>
                    <button 
                      className="btn-icon-small" 
                      onClick={() => setParsed(null)}
                      title="Discard"
                    >
                      ×
                    </button>
                  </div>
                  <div className="input-with-label">
                    <span className="input-label">Name</span>
                    <input 
                      className="input" 
                      value={parsed.name} 
                      onChange={(e) => setParsed({ ...parsed, name: e.target.value })} 
                    />
                  </div>
                  <div className="input-with-label">
                    <span className="input-label">Pattern</span>
                    <input 
                      className="input" 
                      value={parsed.condition} 
                      onChange={(e) => setParsed({ ...parsed, condition: e.target.value })} 
                    />
                  </div>
                  <div className="input-with-label">
                    <span className="input-label">Destination</span>
                    <input 
                      className="input" 
                      value={parsed.destination} 
                      onChange={(e) => setParsed({ ...parsed, destination: e.target.value })} 
                    />
                  </div>
                  <button 
                    className="btn btn-success" 
                    onClick={handleConfirmParsed}
                    style={{ width: "100%" }}
                  >
                    <Plus size={16} />
                    Create Rule
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="create-form">
              <div className="input-with-label">
                <span className="input-label">Rule Name</span>
                <input 
                  className="input" 
                  placeholder="e.g. PDFs to Documents" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="input-with-label">
                <span className="input-label">File Pattern</span>
                <input 
                  className="input" 
                  placeholder="e.g. *.pdf" 
                  value={condition} 
                  onChange={(e) => setCondition(e.target.value)} 
                />
              </div>
              <div className="input-with-label">
                <span className="input-label">Destination Folder</span>
                <input 
                  className="input" 
                  placeholder="e.g. C:\Documents\PDFs" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)} 
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleManualAdd}
                disabled={!name.trim() || !condition.trim() || !destination.trim()}
                style={{ width: "100%" }}
              >
                <Plus size={16} />
                Add Rule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
