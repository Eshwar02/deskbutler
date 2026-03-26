import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const items = [
  { label: "Home", icon: "⌂", path: "/" },
  { label: "Folders", icon: "◫", path: "/folders" },
  { label: "Rules", icon: "⚡", path: "/rules" },
  { label: "History", icon: "↺", path: "/history" },
  { label: "Settings", icon: "⊙", path: "/settings" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            setQuery("");
            setSelectedIndex(0);
            return false;
          }
          return true;
        });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        navigate(filtered[selectedIndex].path);
        close();
      }
    }
  }

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={close}>
      <div className="cmd-dialog" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmd-input"
          type="text"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="cmd-results">
          {filtered.map((item, index) => (
            <div
              key={item.path}
              className={`cmd-item ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => {
                navigate(item.path);
                close();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="cmd-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
