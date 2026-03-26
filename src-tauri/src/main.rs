#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod tray;

use std::sync::Mutex;
use tauri::api::process::{Command as SidecarCommand, CommandChild};
use tauri::Manager;

struct PythonProcess(Mutex<Option<CommandChild>>);

fn main() {
    tauri::Builder::default()
        .manage(PythonProcess(Mutex::new(None)))
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
            commands::get_settings,
            commands::save_settings,
            commands::check_backend,
            commands::check_ollama,
            commands::pull_ollama_model,
            commands::parse_rule_prompt,
            commands::get_paths,
        ])
        .setup(|app| {
            // Spawn Python sidecar
            let (rx, child) = SidecarCommand::new_sidecar("deskbutler-engine")
                .expect("failed to setup sidecar")
                .spawn()
                .expect("failed to spawn sidecar");

            // Log sidecar output in debug mode
            #[cfg(debug_assertions)]
            tauri::async_runtime::spawn(async move {
                use tauri::api::process::CommandEvent;
                let mut rx = rx;
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => println!("[engine] {}", line),
                        CommandEvent::Stderr(line) => eprintln!("[engine] {}", line),
                        _ => {}
                    }
                }
            });

            #[cfg(not(debug_assertions))]
            drop(rx);

            let state = app.state::<PythonProcess>();
            *state.0.lock().unwrap() = Some(child);

            let window = app.get_window("main").unwrap();
            window.set_title("DeskButler").unwrap();
            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::Destroyed = event.event() {
                // Kill Python sidecar when app closes
                let state = event.window().state::<PythonProcess>();
                let mut guard = state.0.lock().unwrap();
                if let Some(child) = guard.take() {
                    let _ = child.kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running DeskButler");
}
