import { useState, useEffect, useMemo, useCallback } from "react";
import { getSuggestions, checkOllamaStatus, getWatchedFolders, getHistory, getRules, notify } from "../utils/tauri";
import { usePageVisibility } from "../hooks/usePageVisibility";
import { perfMonitor } from "../utils/performance";
import SuggestionCard from "./SuggestionCard";

export default function Dashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [folderCount, setFolderCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [ruleCount, setRuleCount] = useState(0);
  const [prevSuggestionIds, setPrevSuggestionIds] = useState(new Set());
  const [mounted, setMounted] = useState(false);
  const isVisible = usePageVisibility();

  const getTimeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const load = useCallback(async () => {
    perfMonitor.start('dashboard-load');
    setLoading(true);
    setError(null);
    try {
      const data = await getSuggestions();

      const currentIds = new Set(data.map((s) => s.id));
      const newOnes = data.filter((s) => !prevSuggestionIds.has(s.id));
      if (newOnes.length > 0 && prevSuggestionIds.size > 0) {
        notify("DeskButler", `${newOnes.length} new file suggestion${newOnes.length > 1 ? "s" : ""} ready for review.`);
      }
      setPrevSuggestionIds(currentIds);

      setSuggestions(data);
    } catch (e) {
      setError("Could not reach backend. Is the Python server running?");
      setSuggestions([]);
    } finally {
      setLoading(false);
      perfMonitor.end('dashboard-load');
    }
  }, [prevSuggestionIds]);

  // Load initial data once
  useEffect(() => {
    Promise.all([
      checkOllamaStatus().catch(() => null),
      getWatchedFolders().catch(() => []),
      getHistory().catch(() => []),
      getRules().catch(() => []),
    ]).then(([ollama, folders, history, rules]) => {
      setOllamaStatus(ollama);
      setFolderCount(folders.length);
      setHistoryCount(history.length);
      setRuleCount(rules.length);
    });

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setTimeout(() => setMounted(true), 50);
  }, []);

  // Smart polling: only when page is visible
  useEffect(() => {
    if (!isVisible) return;

    load();
    const interval = setInterval(() => {
      if (document.hidden) return; // Double-check visibility
      load();
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, load]);

  const ollamaStatusColor = useMemo(() => {
    if (!ollamaStatus?.running) return "offline";
    if (ollamaStatus.selected_model_available) return "online";
    return "warning";
  }, [ollamaStatus]);

  const ollamaStatusText = useMemo(() => {
    if (!ollamaStatus?.running) return "Offline";
    if (ollamaStatus.selected_model_available) return "Ready";
    return "No model";
  }, [ollamaStatus]);

  return (
    <div className={`page dashboard-page ${mounted ? "dashboard-mounted" : ""}`}>
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1 className="dashboard-greeting">{getTimeBasedGreeting}</h1>
          <p className="dashboard-subtitle">
            Your intelligent file organizer is keeping things tidy ✨
          </p>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-stats">
          <div className="dashboard-stat-card glass-card" style={{ "--stagger": 0 }}>
            <div className="dashboard-stat-icon">📁</div>
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-value">{historyCount}</div>
              <div className="dashboard-stat-label">Files Organized</div>
            </div>
          </div>
          <div className="dashboard-stat-card glass-card" style={{ "--stagger": 1 }}>
            <div className="dashboard-stat-icon">⚡</div>
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-value">{ruleCount}</div>
              <div className="dashboard-stat-label">Active Rules</div>
            </div>
          </div>
          <div className="dashboard-stat-card glass-card" style={{ "--stagger": 2 }}>
            <div className="dashboard-stat-icon">🎯</div>
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-value">{suggestions.length}</div>
              <div className="dashboard-stat-label">Pending Actions</div>
            </div>
          </div>
          <div className="dashboard-stat-card glass-card" style={{ "--stagger": 3 }}>
            <div className="dashboard-stat-icon">👁️</div>
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-value">{folderCount}</div>
              <div className="dashboard-stat-label">Watched Folders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="dashboard-status-bar">
        <div className="status-chip-pill status-online">
          <span className="status-dot" />
          <span>Backend Online</span>
        </div>
        <div className={`status-chip-pill status-${ollamaStatusColor}`}>
          <span className="status-dot" />
          <span>Ollama {ollamaStatusText}</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="dashboard-error-banner">
          <div className="dashboard-error-icon">⚠️</div>
          <div className="dashboard-error-content">
            <div className="dashboard-error-title">Connection Error</div>
            <div className="dashboard-error-message">{error}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {loading && suggestions.length === 0 ? (
          <div className="dashboard-skeleton-grid">
            <SkeletonCard style={{ "--stagger": 0 }} />
            <SkeletonCard style={{ "--stagger": 1 }} />
            <SkeletonCard style={{ "--stagger": 2 }} />
          </div>
        ) : suggestions.length === 0 && !error ? (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-illustration">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="2" opacity="0.1" />
                <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <path d="M60 45L60 60L70 70" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="dashboard-empty-title">All caught up!</h3>
            <p className="dashboard-empty-message">
              No suggestions at the moment. DeskButler is watching your folders and will notify you when files need organizing.
            </p>
            <button className="btn btn-accent" onClick={() => window.location.hash = "#/folders"}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "6px" }}>
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add a Folder
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Pending Suggestions</h2>
              <div className="dashboard-section-badge">{suggestions.length}</div>
            </div>
            <div className="dashboard-suggestions-grid">
              {suggestions.map((s, idx) => (
                <div
                  key={s.id}
                  className="dashboard-suggestion-wrapper"
                  style={{ "--stagger": idx }}
                >
                  <SuggestionCard suggestion={s} onAction={load} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonCard({ style }) {
  return (
    <div className="dashboard-skeleton-card" style={style}>
      <div className="dashboard-skeleton-header">
        <div className="dashboard-skeleton-line skeleton-shimmer" style={{ width: "60%" }} />
        <div className="dashboard-skeleton-line skeleton-shimmer" style={{ width: "30%" }} />
      </div>
      <div className="dashboard-skeleton-body">
        <div className="dashboard-skeleton-line skeleton-shimmer" style={{ width: "100%" }} />
        <div className="dashboard-skeleton-line skeleton-shimmer" style={{ width: "85%" }} />
        <div className="dashboard-skeleton-line skeleton-shimmer" style={{ width: "70%" }} />
      </div>
      <div className="dashboard-skeleton-footer">
        <div className="dashboard-skeleton-button skeleton-shimmer" />
        <div className="dashboard-skeleton-button skeleton-shimmer" />
      </div>
    </div>
  );
}
