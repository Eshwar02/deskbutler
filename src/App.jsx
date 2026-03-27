import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { waitForBackend } from "./utils/tauri";
import { useTheme } from "./hooks/useTheme";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import CommandPalette from "./components/CommandPalette";

// Lazy load route components for code splitting
const Dashboard = lazy(() => import("./components/Dashboard"));
const FolderWatcher = lazy(() => import("./components/FolderWatcher"));
const RuleBuilder = lazy(() => import("./components/RuleBuilder"));
const History = lazy(() => import("./components/History"));
const Settings = lazy(() => import("./components/Settings"));

// Suspense fallback component
function PageSkeleton() {
  return (
    <div className="page-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-shimmer" style={{ width: "30%", height: "32px" }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "50%", height: "20px", marginTop: "12px" }} />
      </div>
      <div className="skeleton-content">
        <div className="skeleton-card skeleton-shimmer" style={{ height: "200px" }} />
        <div className="skeleton-card skeleton-shimmer" style={{ height: "200px" }} />
        <div className="skeleton-card skeleton-shimmer" style={{ height: "200px" }} />
      </div>
      <style jsx>{`
        .page-skeleton {
          padding: 32px;
          animation: fadeIn 200ms ease;
        }
        .skeleton-header {
          margin-bottom: 32px;
        }
        .skeleton-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .skeleton-line, .skeleton-card {
          background: rgba(0, 0, 0, 0.06);
          border-radius: 8px;
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.06) 0%,
            rgba(0, 0, 0, 0.12) 50%,
            rgba(0, 0, 0, 0.06) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-color-scheme: dark) {
          .skeleton-line, .skeleton-card {
            background: rgba(255, 255, 255, 0.06);
          }
          .skeleton-shimmer {
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.06) 0%,
              rgba(255, 255, 255, 0.12) 50%,
              rgba(255, 255, 255, 0.06) 100%
            );
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  
  // Initialize theme system
  useTheme();

  const tryConnect = useCallback(() => {
    setFailed(false);
    setReady(false);
    waitForBackend().then((ok) => {
      if (ok) setReady(true);
      else setFailed(true);
    });
  }, []);

  useEffect(() => {
    tryConnect();
  }, [tryConnect]);

  if (failed) {
    return (
      <div className="startup-screen">
        <div className="startup-content">
          <h2>Backend Unavailable</h2>
          <p>Could not connect to the DeskButler engine.</p>
          <button className="btn btn-primary" onClick={tryConnect}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="startup-screen">
        <div className="startup-content">
          <h2>Starting DeskButler...</h2>
          <p>Waiting for the backend engine to start.</p>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <TopBar />
          <main className="main-content">
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/folders" element={<FolderWatcher />} />
                <Route path="/rules" element={<RuleBuilder />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <CommandPalette />
      </div>
    </BrowserRouter>
  );
}
