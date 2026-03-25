#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod tray;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .system_tray(tray::create_tray())
        .on_system_tray_event(tray::handle_tray_event)
        .invoke_handler(tauri::generate_handler![
            commands::get_suggestions,
            commands::approve_suggestion,
            commands::reject_suggestion,
            commands::get_watched_folders,
            commands::add_watched_folder,
            commands::remove_watched_folder,
            commands::get_history,
            commands::undo_move,
            commands::get_rules,
            commands::add_rule,
            commands::delete_rule,
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_title("DeskButler").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DeskButler");
}
