import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";

// Command definitions with categories
const COMMANDS = [
  // Navigation
  {
    id: "nav-dashboard",
    label: "Go to Dashboard",
    category: "Navigation",
    icon: "🏠",
    shortcut: "⌘1",
    keywords: ["home", "dashboard", "overview"],
    action: "navigate",
    target: "/",
  },
  {
    id: "nav-folders",
    label: "Go to Folders",
    category: "Navigation",
    icon: "📁",
    shortcut: "⌘2",
    keywords: ["folders", "watch", "monitored"],
    action: "navigate",
    target: "/folders",
  },
  {
    id: "nav-rules",
    label: "Go to Rules",
    category: "Navigation",
    icon: "⚡",
    shortcut: "⌘3",
    keywords: ["rules", "automation", "organize"],
    action: "navigate",
    target: "/rules",
  },
  {
    id: "nav-history",
    label: "View History",
    category: "Navigation",
    icon: "🕐",
    shortcut: "⌘4",
    keywords: ["history", "log", "past", "activity"],
    action: "navigate",
    target: "/history",
  },
  {
    id: "nav-settings",
    label: "Settings",
    category: "Navigation",
    icon: "⚙️",
    shortcut: "⌘5",
    keywords: ["settings", "preferences", "config"],
    action: "navigate",
    target: "/settings",
  },
  // Actions
  {
    id: "action-add-folder",
    label: "Add Folder",
    category: "Actions",
    icon: "➕",
    keywords: ["add", "new", "folder", "watch", "monitor"],
    action: "custom",
    target: "add-folder",
  },
  {
    id: "action-create-rule",
    label: "Create Rule",
    category: "Actions",
    icon: "✨",
    keywords: ["create", "new", "rule", "automation"],
    action: "navigate",
    target: "/rules",
    focus: true,
  },
  {
    id: "action-undo",
    label: "Undo Last Action",
    category: "Actions",
    icon: "↩️",
    keywords: ["undo", "revert", "rollback"],
    action: "custom",
    target: "undo",
  },
  // Settings
  {
    id: "setting-theme",
    label: "Toggle Theme",
    category: "Settings",
    icon: "🌓",
    keywords: ["theme", "dark", "light", "mode"],
    action: "custom",
    target: "toggle-theme",
  },
  {
    id: "setting-notifications",
    label: "Toggle Notifications",
    category: "Settings",
    icon: "🔔",
    keywords: ["notifications", "alerts", "notify"],
    action: "custom",
    target: "toggle-notifications",
  },
  // Search
  {
    id: "search-files",
    label: "Search Files",
    category: "Search",
    icon: "🔍",
    keywords: ["search", "find", "files", "documents"],
    action: "custom",
    target: "search-files",
  },
  {
    id: "search-rules",
    label: "Search Rules",
    category: "Search",
    icon: "🔎",
    keywords: ["search", "find", "rules"],
    action: "navigate",
    target: "/rules",
    focus: true,
  },
];

// Fuzzy search scoring
function fuzzyMatch(text, query) {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return 100;
  }
  
  // Fuzzy matching
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 10;
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length ? score : 0;
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 150);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("commandPaletteRecent");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Filter and sort commands (use debounced query)
  const filtered = debouncedQuery.trim() === "" 
    ? [] 
    : COMMANDS.map(cmd => {
        // Search in label and keywords
        const labelScore = fuzzyMatch(cmd.label, debouncedQuery);
        const keywordScore = Math.max(0, ...cmd.keywords.map(k => fuzzyMatch(k, debouncedQuery)));
        const categoryScore = fuzzyMatch(cmd.category, debouncedQuery);
        
        return {
          ...cmd,
          score: Math.max(labelScore, keywordScore, categoryScore),
        };
      })
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score);

  // Group by category
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const categories = Object.keys(grouped);
  
  // Flatten for navigation
  const flatList = filtered;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const addToRecent = useCallback((command) => {
    const recent = [command.id, ...recentSearches.filter(id => id !== command.id)].slice(0, 5);
    setRecentSearches(recent);
    try {
      localStorage.setItem("commandPaletteRecent", JSON.stringify(recent));
    } catch (e) {
      // Ignore
    }
  }, [recentSearches]);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("commandPaletteRecent");
    } catch (e) {
      // Ignore
    }
  }, []);

  const executeCommand = useCallback((command) => {
    if (!command) return;
    
    addToRecent(command);
    
    if (command.action === "navigate") {
      navigate(command.target);
      close();
      if (command.focus) {
        // Add small delay for navigation to complete
        setTimeout(() => {
          const input = document.querySelector('input[type="text"]');
          if (input) input.focus();
        }, 100);
      }
    } else if (command.action === "custom") {
      // Handle custom actions
      switch (command.target) {
        case "toggle-theme":
          // Toggle between light and dark theme
          document.documentElement.classList.toggle("dark");
          close();
          break;
        case "toggle-notifications":
          // This would typically interact with settings
          alert("Toggle notifications - integrate with settings store");
          close();
          break;
        case "add-folder":
          navigate("/folders");
          close();
          setTimeout(() => {
            // Trigger add folder action
            const addButton = document.querySelector('button[aria-label="Add folder"]');
            if (addButton) addButton.click();
          }, 100);
          break;
        case "undo":
          alert("Undo functionality - integrate with undo/redo system");
          close();
          break;
        case "search-files":
          alert("Search files - integrate with file search");
          close();
          break;
        default:
          close();
      }
    }
  }, [navigate, close, addToRecent]);

  // Keyboard shortcuts: Cmd/Ctrl + K
  useEffect(() => {
    function handleKeyDown(e) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (modKey && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
        if (!open) {
          setQuery("");
          setSelectedIndex(0);
        }
      }
      
      // Number shortcuts when palette is open
      if (open && modKey && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (flatList[index]) {
          executeCommand(flatList[index]);
        }
      }
    }
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, flatList, executeCommand]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset selection on debounced query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector('.cmd-item.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatList.length - 1));
      return;
    }
    
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
      return;
    }
    
    if (e.key === "Enter") {
      e.preventDefault();
      if (flatList[selectedIndex]) {
        executeCommand(flatList[selectedIndex]);
      }
      return;
    }
  }

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Recent commands to display when no query
  const recentCommands = recentSearches
    .map(id => COMMANDS.find(cmd => cmd.id === id))
    .filter(Boolean);

  if (!open) return null;

  return (
    <div 
      className="cmd-overlay" 
      onClick={close}
      style={{ animation: 'fadeIn 200ms ease' }}
    >
      <div 
        className="cmd-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          animation: 'slideUp 200ms ease',
          maxWidth: '640px',
        }}
      >
        {/* Search Input */}
        <div className="cmd-input-wrapper">
          <span className="cmd-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="cmd-input"
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button 
              className="cmd-clear-btn"
              onClick={clearQuery}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        <div className="cmd-results" ref={resultsRef}>
          {query.trim() === "" && recentCommands.length > 0 ? (
            // Show recent searches when empty
            <div className="cmd-category">
              <div className="cmd-category-header">
                <span className="cmd-category-title">Recent</span>
                <button 
                  className="cmd-clear-history"
                  onClick={clearRecent}
                >
                  Clear
                </button>
              </div>
              {recentCommands.map((cmd, index) => (
                <div
                  key={cmd.id}
                  className={`cmd-item ${index === selectedIndex ? "selected" : ""}`}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="cmd-item-icon">{cmd.icon}</span>
                  <span className="cmd-item-label">{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="cmd-item-shortcut">{cmd.shortcut}</span>
                  )}
                </div>
              ))}
            </div>
          ) : query.trim() === "" ? (
            // Show helpful message when empty and no recents
            <div className="cmd-empty">
              <p>Type to search commands...</p>
              <div className="cmd-hint">
                <kbd>↑</kbd> <kbd>↓</kbd> to navigate
                <span className="cmd-hint-sep">•</span>
                <kbd>↵</kbd> to select
                <span className="cmd-hint-sep">•</span>
                <kbd>esc</kbd> to close
              </div>
            </div>
          ) : flatList.length > 0 ? (
            // Show grouped results
            <>
              {categories.map(category => (
                <div key={category} className="cmd-category">
                  <div className="cmd-category-title">{category}</div>
                  {grouped[category].map((cmd) => {
                    const globalIndex = flatList.indexOf(cmd);
                    const displayIndex = globalIndex < 9 ? globalIndex + 1 : null;
                    
                    return (
                      <div
                        key={cmd.id}
                        className={`cmd-item ${globalIndex === selectedIndex ? "selected" : ""}`}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <span className="cmd-item-icon">{cmd.icon}</span>
                        <span className="cmd-item-label">{cmd.label}</span>
                        {displayIndex && (
                          <span className="cmd-item-number">⌘{displayIndex}</span>
                        )}
                        {cmd.shortcut && !displayIndex && (
                          <span className="cmd-item-shortcut">{cmd.shortcut}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            // No results
            <div className="cmd-empty">
              <p>No commands found</p>
              <p className="cmd-empty-hint">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CommandPalette);
