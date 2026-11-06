pub mod insertion;
pub mod window;

use std::str::FromStr;
use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use window::{get_foreground_window, restore_foreground_window, AppState};

#[tauri::command]
fn toggle_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let is_visible = overlay.is_visible().unwrap_or(false);

        if is_visible {
            overlay.hide().ok();
            let state = app.state::<AppState>();
            if let Ok(guard) = state.previous_hwnd.lock() {
                if let Some(hwnd) = *guard {
                    restore_foreground_window(hwnd);
                }
            }
        } else {
            let state = app.state::<AppState>();
            let current_hwnd = get_foreground_window();
            if let Ok(mut guard) = state.previous_hwnd.lock() {
                *guard = current_hwnd;
            }

            overlay.center().ok();
            overlay.show().ok();
            overlay.set_focus().ok();
        }
    }
}

#[tauri::command]
fn show_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let state = app.state::<AppState>();
        let current_hwnd = get_foreground_window();
        if let Ok(mut guard) = state.previous_hwnd.lock() {
            *guard = current_hwnd;
        }

        overlay.center().ok();
        overlay.show().ok();
        overlay.set_focus().ok();
    }
}

#[tauri::command]
fn hide_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().ok();
        let state = app.state::<AppState>();
        if let Ok(guard) = state.previous_hwnd.lock() {
            if let Some(hwnd) = *guard {
                restore_foreground_window(hwnd);
            }
        }
    }
}

#[tauri::command]
fn insert_text(app: AppHandle, text: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    let previous_hwnd = {
        let guard = state.previous_hwnd.lock().map_err(|e| e.to_string())?;
        *guard
    };

    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().ok();
    }

    app.clipboard()
        .write_text(&text)
        .map_err(|e| e.to_string())?;

    if let Some(hwnd) = previous_hwnd {
        restore_foreground_window(hwnd);
    }

    std::thread::sleep(std::time::Duration::from_millis(60));
    insertion::simulate_paste();

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Ok(target) = Shortcut::from_str("CommandOrControl+Space") {
                            if shortcut == &target {
                                toggle_overlay(app.clone());
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            if let Ok(shortcut) = Shortcut::from_str("CommandOrControl+Space") {
                let _ = app.global_shortcut().register(shortcut);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_overlay,
            hide_overlay,
            toggle_overlay,
            insert_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
