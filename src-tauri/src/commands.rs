use serde::{Deserialize, Serialize};

const PYTHON_API: &str = "http://127.0.0.1:7342";

#[derive(Serialize, Deserialize, Clone)]
pub struct Suggestion {
    pub id: String,
    pub filename: String,
    pub from_path: String,
    pub to_path: String,
    pub reason: String,
    pub confidence: f32,
}

#[derive(Serialize, Deserialize)]
pub struct WatchedFolder {
    pub path: String,
    pub enabled: bool,
}

#[derive(Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub filename: String,
    pub from_path: String,
    pub to_path: String,
    pub moved_at: String,
    pub undone: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Rule {
    pub id: String,
    pub name: String,
    pub condition: String,
    pub destination: String,
    pub enabled: bool,
}

async fn api_get(path: &str) -> Result<String, String> {
    reqwest::get(format!("{PYTHON_API}{path}"))
        .await
        .map_err(|e| format!("Backend not reachable: {e}"))?
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {e}"))
}

async fn api_post(path: &str, body: serde_json::Value) -> Result<String, String> {
    reqwest::Client::new()
        .post(format!("{PYTHON_API}{path}"))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Backend not reachable: {e}"))?
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {e}"))
}

#[tauri::command]
pub async fn get_suggestions() -> Result<Vec<Suggestion>, String> {
    let resp = api_get("/suggestions").await?;
    serde_json::from_str(&resp).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn approve_suggestion(id: String) -> Result<String, String> {
    api_post("/suggestions/approve", serde_json::json!({ "id": id })).await
}

#[tauri::command]
pub async fn reject_suggestion(id: String) -> Result<String, String> {
    api_post("/suggestions/reject", serde_json::json!({ "id": id })).await
}

#[tauri::command]
pub async fn get_watched_folders() -> Result<Vec<WatchedFolder>, String> {
    let resp = api_get("/folders").await?;
    serde_json::from_str(&resp).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_watched_folder(path: String) -> Result<String, String> {
    api_post("/folders", serde_json::json!({ "path": path })).await
}

#[tauri::command]
pub async fn remove_watched_folder(path: String) -> Result<String, String> {
    api_post("/folders/remove", serde_json::json!({ "path": path })).await
}

#[tauri::command]
pub async fn get_history() -> Result<Vec<HistoryEntry>, String> {
    let resp = api_get("/history").await?;
    serde_json::from_str(&resp).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn undo_move(id: String) -> Result<String, String> {
    api_post("/history/undo", serde_json::json!({ "id": id })).await
}

#[tauri::command]
pub async fn get_rules() -> Result<Vec<Rule>, String> {
    let resp = api_get("/rules").await?;
    serde_json::from_str(&resp).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_rule(name: String, condition: String, destination: String) -> Result<String, String> {
    api_post("/rules", serde_json::json!({ "name": name, "condition": condition, "destination": destination })).await
}

#[tauri::command]
pub async fn delete_rule(id: String) -> Result<String, String> {
    api_post("/rules/delete", serde_json::json!({ "id": id })).await
}

#[tauri::command]
pub async fn get_settings() -> Result<String, String> {
    api_get("/settings").await
}

#[tauri::command]
pub async fn save_settings(settings: serde_json::Value) -> Result<String, String> {
    api_post("/settings", settings).await
}

#[tauri::command]
pub async fn check_backend() -> Result<String, String> {
    api_get("/health").await
}
