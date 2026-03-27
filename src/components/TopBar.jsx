import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Settings,
  Home,
  ChevronRight
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import "./TopBar.css";

const breadcrumbMap = {
  "/": ["Home"],
  "/folders": ["Home", "Folders"],
  "/rules": ["Home", "Rules"],
  "/history": ["Home", "History"],
  "/settings": ["Home", "Settings"],
};

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme, setTheme, isDark } = useTheme();
  const [notificationCount, setNotificationCount] = useState(2);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("topbar-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const handleSearchClick = () => {
    // Trigger command palette by simulating Cmd/Ctrl + K
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  };

  const breadcrumbs = breadcrumbMap[location.pathname] || ["Home"];

  return (
    <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
      <div className="topbar-content">
        {/* Left: Breadcrumb Navigation */}
        <nav className="topbar-breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="breadcrumb-item">
              {index > 0 && (
                <ChevronRight 
                  className="breadcrumb-separator" 
                  size={14} 
                />
              )}
              {index === 0 ? (
                <Link to="/" className="breadcrumb-link">
                  <Home size={16} />
                  <span>{crumb}</span>
                </Link>
              ) : (
                <span className="breadcrumb-current">{crumb}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Center: Global Search */}
        <div 
          className={`topbar-search-wrapper ${searchFocused ? "focused" : ""}`}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        >
          <Search className="search-icon" size={16} />
          <input
            id="topbar-search"
            type="text"
            className="topbar-search"
            placeholder="Search files, rules, history..."
            onClick={handleSearchClick}
            readOnly
          />
          <kbd className="search-kbd">
            {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} K
          </kbd>
        </div>

        {/* Right: Actions */}
        <div className="topbar-actions">
          {/* Notifications */}
          <button 
            className="topbar-action-btn"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>

          {/* Theme Toggle */}
          <button 
            className="topbar-action-btn theme-toggle-btn"
            onClick={handleThemeToggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* Settings/Profile */}
          <Link 
            to="/settings"
            className="topbar-action-btn"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
