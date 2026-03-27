import { useState, useEffect, memo } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  FolderOpen, 
  Settings as SettingsIcon, 
  Clock, 
  Settings as RulesIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/folders", label: "Folders", icon: FolderOpen },
  { to: "/rules", label: "Rules", icon: RulesIcon },
  { to: "/history", label: "History", icon: Clock },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <nav 
      className={`sidebar-premium ${collapsed ? "collapsed" : ""}`}
      style={{
        width: collapsed ? "64px" : "240px",
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="sidebar-content">
        {/* Brand Section */}
        <div className="sidebar-brand-section">
          <div className="sidebar-brand">
            <div className="brand-icon">DB</div>
            <span 
              className="brand-text"
              style={{
                opacity: collapsed ? 0 : 1,
                transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                whiteSpace: "nowrap",
              }}
            >
              DeskButler
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-nav-section">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.to}
                className="nav-item-wrapper"
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <div className="nav-item-content">
                    <Icon className="nav-icon" size={20} />
                    <span 
                      className="nav-label"
                      style={{
                        opacity: collapsed ? 0 : 1,
                        width: collapsed ? 0 : "auto",
                        transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </NavLink>

                {/* Tooltip for collapsed state */}
                {collapsed && hoveredItem === item.to && (
                  <div className="nav-tooltip">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Toggle Button */}
        <div className="sidebar-footer">
          <button
            className="collapse-toggle"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span 
                  className="toggle-label"
                  style={{
                    opacity: collapsed ? 0 : 1,
                    transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Collapse
                </span>
              </>
            )}
          </button>
          {!collapsed && (
            <div className="keyboard-hint">
              <kbd>⌘</kbd> <kbd>B</kbd>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sidebar-premium {
          height: 100vh;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 16px 12px;
        }

        /* Brand Section */
        .sidebar-brand-section {
          margin-bottom: 32px;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .brand-text {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          overflow: hidden;
        }

        /* Navigation Section */
        .sidebar-nav-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item-wrapper {
          position: relative;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: #6b7280;
          position: relative;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .nav-item:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #1a1a1a;
        }

        .nav-item.active {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          font-weight: 500;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #667eea;
          border-radius: 0 2px 2px 0;
          animation: slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: 60%;
            opacity: 1;
          }
        }

        .nav-item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .nav-icon {
          flex-shrink: 0;
          transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          font-size: 14px;
          letter-spacing: -0.01em;
        }

        /* Tooltip */
        .nav-tooltip {
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1000;
          animation: tooltipFadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-right-color: rgba(0, 0, 0, 0.9);
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }

        /* Footer Section */
        .sidebar-footer {
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .collapse-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
          font-family: inherit;
        }

        .collapse-toggle:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #1a1a1a;
        }

        .toggle-label {
          white-space: nowrap;
          overflow: hidden;
        }

        .keyboard-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 11px;
          color: #9ca3af;
          opacity: 0;
          animation: fadeInUp 300ms cubic-bezier(0.4, 0, 0.2, 1) 200ms forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .keyboard-hint kbd {
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          font-size: 10px;
          font-family: ui-monospace, monospace;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .sidebar-premium {
            background: rgba(0, 0, 0, 0.5);
            border-right-color: rgba(255, 255, 255, 0.1);
          }

          .brand-text {
            color: #ffffff;
          }

          .nav-item {
            color: #9ca3af;
          }

          .nav-item:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
          }

          .nav-item.active {
            background: rgba(102, 126, 234, 0.15);
            color: #818cf8;
          }

          .nav-item.active::before {
            background: #818cf8;
          }

          .collapse-toggle {
            color: #9ca3af;
          }

          .collapse-toggle:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
          }

          .keyboard-hint kbd {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
          }
        }

        /* Collapsed state adjustments */
        .sidebar-premium.collapsed .nav-item {
          justify-content: center;
        }

        .sidebar-premium.collapsed .collapse-toggle {
          justify-content: center;
        }
      `}</style>
    </nav>
  );
}

export default memo(Sidebar);
