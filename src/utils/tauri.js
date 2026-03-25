import { invoke } from "@tauri-apps/api/tauri";

export async function getSuggestions() {
  return invoke("get_suggestions");
}

export async function approveSuggestion(id) {
  return invoke("approve_suggestion", { id });
}

export async function rejectSuggestion(id) {
  return invoke("reject_suggestion", { id });
}

export async function getWatchedFolders() {
  return invoke("get_watched_folders");
}

export async function addWatchedFolder(path) {
  return invoke("add_watched_folder", { path });
}

export async function removeWatchedFolder(path) {
  return invoke("remove_watched_folder", { path });
}

export async function getHistory() {
  return invoke("get_history");
}

export async function undoMove(id) {
  return invoke("undo_move", { id });
}

export async function getRules() {
  return invoke("get_rules");
}

export async function addRule(name, condition, destination) {
  return invoke("add_rule", { name, condition, destination });
}

export async function deleteRule(id) {
  return invoke("delete_rule", { id });
}
