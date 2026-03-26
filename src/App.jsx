import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { waitForBackend } from "./utils/tauri";
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";
import Dashboard from "./components/Dashboard";
import FolderWatcher from "./components/FolderWatcher";
import RuleBuilder from "./components/RuleBuilder";
import History from "./components/History";
import Settings from "./components/Settings";

export default function App() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

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
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/folders" element={<FolderWatcher />} />
              <Route path="/rules" element={<RuleBuilder />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
        <CommandPalette />
      </div>
    </BrowserRouter>
  );
}
