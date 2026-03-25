import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import FolderWatcher from "./components/FolderWatcher";
import RuleBuilder from "./components/RuleBuilder";
import History from "./components/History";
import Settings from "./components/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
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
    </BrowserRouter>
  );
}
