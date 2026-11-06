use tauri::{AppHandle, Manager};

#[tauri::command]
fn show_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.show().ok();
        overlay.set_focus().ok();
    }
}

#[tauri::command]
fn hide_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().ok();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![show_overlay, hide_overlay])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
