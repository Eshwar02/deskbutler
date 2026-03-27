/**
 * Tauri invoke helpers with browser fallback.
 * When running outside Tauri (npm run dev in browser), falls back to
 * direct HTTP calls to the Python API.
 */

const API_BASE = "http://127.0.0.1:7342";

export const isTauri = () => Boolean(window.__TAURI__);

async function tauriInvoke(command, args) {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/tauri");
    return invoke(command, args);
  }
  return apiFallback(command, args);
}

async function apiFallback(command, args = {}) {
  const map = {
    get_suggestions: () => get("/suggestions"),
    approve_suggestion: () => post("/suggestions/approve", { id: args.id }),
    reject_suggestion: () => post("/suggestions/reject", { id: args.id }),
    get_watched_folders: () => get("/folders"),
    add_watched_folder: () => post("/folders", { path: args.path }),
    remove_watched_folder: () => post("/folders/remove", { path: args.path }),
    get_history: () => get("/history"),
    undo_move: () => post("/history/undo", { id: args.id }),
    get_rules: () => get("/rules"),
    add_rule: () =>
      post("/rules", {
        name: args.name,
        condition: args.condition,
        destination: args.destination,
      }),
    delete_rule: () => post("/rules/delete", { id: args.id }),
    get_settings: () => get("/settings"),
    save_settings: () => post("/settings", args),
    check_ollama: () => get("/ollama/status"),
    pull_ollama_model: () => post("/ollama/pull", { model: args.model }),
    parse_rule_prompt: () => post("/rules/parse-prompt", { prompt: args.prompt }),
    get_paths: () => get("/paths"),
    check_autolaunch: () => get("/autolaunch/status"),
    enable_autolaunch: () => post("/autolaunch/enable", {}),
    disable_autolaunch: () => post("/autolaunch/disable", {}),
  };

  const handler = map[command];
  if (!handler) throw new Error(`Unknown command: ${command}`);
  return handler();
}

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- Backend readiness ---

export async function waitForBackend(maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (isTauri()) {
        const { invoke } = await import("@tauri-apps/api/tauri");
        await invoke("check_backend");
      } else {
        await get("/health");
      }
      return true;
    } catch {
      const delay = Math.min(500 + i * 150, 2000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return false;
}

// --- Notifications ---

export function notify(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body });
    });
  }
}

// --- Public API ---

export async function getSuggestions() {
  return tauriInvoke("get_suggestions");
}

export async function approveSuggestion(id) {
  return tauriInvoke("approve_suggestion", { id });
}

export async function rejectSuggestion(id) {
  return tauriInvoke("reject_suggestion", { id });
}

export async function getWatchedFolders() {
  return tauriInvoke("get_watched_folders");
}

export async function addWatchedFolder(path) {
  return tauriInvoke("add_watched_folder", { path });
}

export async function removeWatchedFolder(path) {
  return tauriInvoke("remove_watched_folder", { path });
}

export async function getHistory() {
  return tauriInvoke("get_history");
}

export async function undoMove(id) {
  return tauriInvoke("undo_move", { id });
}

export async function getRules() {
  return tauriInvoke("get_rules");
}

export async function addRule(name, condition, destination) {
  return tauriInvoke("add_rule", { name, condition, destination });
}

export async function deleteRule(id) {
  return tauriInvoke("delete_rule", { id });
}

export async function getSettings() {
  return tauriInvoke("get_settings");
}

export async function saveSettings(settings) {
  return tauriInvoke("save_settings", settings);
}

export async function checkOllamaStatus() {
  return tauriInvoke("check_ollama");
}

export async function pullOllamaModel(model) {
  return tauriInvoke("pull_ollama_model", { model });
}

export async function parseRulePrompt(prompt) {
  return tauriInvoke("parse_rule_prompt", { prompt });
}

export async function getPaths() {
  return tauriInvoke("get_paths");
}

export async function checkAutolaunch() {
  return tauriInvoke("check_autolaunch");
}

export async function enableAutolaunch() {
  return tauriInvoke("enable_autolaunch");
}

export async function disableAutolaunch() {
  return tauriInvoke("disable_autolaunch");
}
