pub mod context;
pub mod insertion;
pub mod window;
#[cfg(target_os = "windows")]
pub mod keyboard_hook;
pub mod server_manager;

use std::str::FromStr;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use window::{get_foreground_window, restore_foreground_window, AppState};
use context::{get_window_context, AppContext};

#[cfg(target_os = "windows")]
fn make_window_non_activating(hwnd: isize) {
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_NOACTIVATE,
    };
    unsafe {
        let ex_style = GetWindowLongPtrW(hwnd as _, GWL_EXSTYLE);
        SetWindowLongPtrW(hwnd as _, GWL_EXSTYLE, ex_style | (WS_EX_NOACTIVATE as isize));
    }
}

#[cfg(target_os = "windows")]
fn show_overlay_non_activating(overlay: &tauri::WebviewWindow) {
    use windows_sys::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_SHOWNOACTIVATE};
    if let Ok(hwnd) = overlay.hwnd() {
        unsafe {
            ShowWindow(hwnd.0 as _, SW_SHOWNOACTIVATE);
        }
    } else {
        overlay.show().ok();
    }
}

#[tauri::command]
fn toggle_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let is_visible = overlay.is_visible().unwrap_or(false);

        if is_visible {
            #[cfg(target_os = "windows")]
            keyboard_hook::set_hook_active(false);
            let _ = overlay.emit("overlay:submit", ());
        } else {
            let state = app.state::<AppState>();
            let current_hwnd = get_foreground_window();
            if let Ok(mut guard) = state.previous_hwnd.lock() {
                *guard = current_hwnd;
            }

            #[cfg(target_os = "windows")]
            keyboard_hook::set_hook_active(true);
            overlay.center().ok();

            #[cfg(target_os = "windows")]
            show_overlay_non_activating(&overlay);

            #[cfg(not(target_os = "windows"))]
            overlay.show().ok();

            let _ = overlay.emit("overlay:show", ());
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

        #[cfg(target_os = "windows")]
        keyboard_hook::set_hook_active(true);
        overlay.center().ok();

        #[cfg(target_os = "windows")]
        show_overlay_non_activating(&overlay);

        #[cfg(not(target_os = "windows"))]
        overlay.show().ok();

        let _ = overlay.emit("overlay:show", ());
    }
}

#[tauri::command]
fn hide_overlay(app: AppHandle) {
    #[cfg(target_os = "windows")]
    keyboard_hook::set_hook_active(false);
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().ok();
        let _ = overlay.emit("overlay:hide", ());
        let state = app.state::<AppState>();
        if let Ok(guard) = state.previous_hwnd.lock() {
            if let Some(hwnd) = *guard {
                restore_foreground_window(hwnd);
            }
        }
    }
}

#[tauri::command]
fn get_active_context(app: AppHandle) -> AppContext {
    let state = app.state::<AppState>();
    let hwnd = match state.previous_hwnd.lock() {
        Ok(guard) => guard.unwrap_or(0),
        Err(_) => 0,
    };
    get_window_context(hwnd)
}

#[tauri::command]
fn insert_text(app: AppHandle, text: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    keyboard_hook::set_hook_active(false);
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
            // Automatically launch background NestJS API server if not already active
            let maybe_server = server_manager::start_server_if_needed();
            if let Some(child) = maybe_server {
                let state = app.state::<AppState>();
                if let Ok(mut guard) = state.server_process.lock() {
                    *guard = Some(child);
                }
            }

            if let Some(overlay) = app.get_webview_window("overlay") {
                #[cfg(target_os = "windows")]
                if let Ok(hwnd) = overlay.hwnd() {
                    make_window_non_activating(hwnd.0 as isize);
                }
            }
            if let Ok(shortcut) = Shortcut::from_str("CommandOrControl+Space") {
                let _ = app.global_shortcut().register(shortcut);
            }
            #[cfg(target_os = "windows")]
            keyboard_hook::init_keyboard_hook(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_overlay,
            hide_overlay,
            toggle_overlay,
            get_active_context,
            insert_text
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                let state = app_handle.state::<AppState>();
                if let Ok(mut guard) = state.server_process.lock() {
                    if let Some(mut child) = guard.take() {
                        server_manager::stop_server(&mut child);
                    }
                }
            }
        });
}
