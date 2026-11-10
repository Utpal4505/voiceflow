pub mod autostart;
pub mod context;
pub mod insertion;
pub mod window;
#[cfg(target_os = "windows")]
pub mod keyboard_hook;
pub mod server_manager;
pub mod tray;
pub mod wake_word;

use std::str::FromStr;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use window::{get_foreground_window, restore_foreground_window, AppState};
use context::{get_window_context, AppContext};

pub(crate) fn trigger_toggle_overlay(app: AppHandle) {
    toggle_overlay(app);
}

pub(crate) fn trigger_wake_word_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        if !is_overlay_window_visible(&overlay) {
            println!("[WakeWord] Triggering show_overlay for hands-free wake word");
            show_overlay(app);
        } else {
            println!("[WakeWord] Overlay is already open and active; keeping dictation session alive");
        }
    }
}

#[cfg(target_os = "windows")]
fn make_window_non_activating(hwnd: isize) {
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetWindowLongPtrW, SetWindowLongPtrW, SetWindowPos, GWL_EXSTYLE, WS_EX_NOACTIVATE,
        WS_EX_LAYERED, SWP_FRAMECHANGED, SWP_NOMOVE, SWP_NOSIZE, SWP_NOZORDER,
    };
    use windows_sys::Win32::Graphics::Dwm::{
        DwmSetWindowAttribute, DWMWA_BORDER_COLOR, DWMWA_WINDOW_CORNER_PREFERENCE,
    };

    unsafe {
        let ex_style = GetWindowLongPtrW(hwnd as _, GWL_EXSTYLE);
        SetWindowLongPtrW(
            hwnd as _,
            GWL_EXSTYLE,
            ex_style | (WS_EX_NOACTIVATE as isize) | (WS_EX_LAYERED as isize),
        );
        SetWindowPos(
            hwnd as _,
            0 as _,
            0,
            0,
            0,
            0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED,
        );

        // 1. Remove Windows 11 window border (0xFFFFFFFE is DWMWA_COLOR_NONE)
        let border_color: u32 = 0xFFFFFFFE;
        let _ = DwmSetWindowAttribute(
            hwnd as _,
            DWMWA_BORDER_COLOR as u32,
            &border_color as *const _ as *const std::ffi::c_void,
            std::mem::size_of::<u32>() as u32,
        );

        // 2. Prevent Windows 11 from rounding outer box (1 is DWMWCP_DONOTROUND)
        let corner_pref: u32 = 1;
        let _ = DwmSetWindowAttribute(
            hwnd as _,
            DWMWA_WINDOW_CORNER_PREFERENCE as u32,
            &corner_pref as *const _ as *const std::ffi::c_void,
            std::mem::size_of::<u32>() as u32,
        );

        println!("[Rust Window] Window configured with WS_EX_NOACTIVATE, WS_EX_LAYERED, DWMWA_COLOR_NONE, DWMWCP_DONOTROUND (hwnd: {:x})", hwnd);
    }
}

#[cfg(target_os = "windows")]
pub fn show_overlay_window(overlay: &tauri::WebviewWindow) {
    use windows_sys::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_SHOWNOACTIVATE};
    if let Ok(hwnd) = overlay.hwnd() {
        make_window_non_activating(hwnd.0 as isize);
        unsafe {
            ShowWindow(hwnd.0 as _, SW_SHOWNOACTIVATE);
        }
    }
    let _ = overlay.show();
    println!("[Rust Overlay] show_overlay_window completed (SW_SHOWNOACTIVATE + Tao show)");
}

#[cfg(not(target_os = "windows"))]
pub fn show_overlay_window(overlay: &tauri::WebviewWindow) {
    let _ = overlay.show();
    println!("[Rust Overlay] show_overlay_window completed (non-Windows)");
}

#[cfg(target_os = "windows")]
pub fn hide_overlay_window(overlay: &tauri::WebviewWindow) {
    use windows_sys::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_HIDE};
    if let Ok(hwnd) = overlay.hwnd() {
        unsafe {
            ShowWindow(hwnd.0 as _, SW_HIDE);
        }
    }
    let _ = overlay.hide();
    println!("[Rust Overlay] hide_overlay_window completed (SW_HIDE + Tao hide)");
}

#[cfg(not(target_os = "windows"))]
pub fn hide_overlay_window(overlay: &tauri::WebviewWindow) {
    let _ = overlay.hide();
    println!("[Rust Overlay] hide_overlay_window completed (non-Windows)");
}

#[cfg(target_os = "windows")]
pub fn is_overlay_window_visible(overlay: &tauri::WebviewWindow) -> bool {
    use windows_sys::Win32::UI::WindowsAndMessaging::IsWindowVisible;
    if let Ok(hwnd) = overlay.hwnd() {
        unsafe {
            return IsWindowVisible(hwnd.0 as _) != 0;
        }
    }
    overlay.is_visible().unwrap_or(false)
}

#[cfg(not(target_os = "windows"))]
pub fn is_overlay_window_visible(overlay: &tauri::WebviewWindow) -> bool {
    overlay.is_visible().unwrap_or(false)
}

#[cfg(target_os = "windows")]
fn is_voiceflow_hwnd(app: &AppHandle, hwnd: isize) -> bool {
    if hwnd == 0 {
        return true;
    }
    if let Some(overlay) = app.get_webview_window("overlay") {
        if let Ok(ohwnd) = overlay.hwnd() {
            if ohwnd.0 as isize == hwnd {
                return true;
            }
        }
    }
    if let Some(main_win) = app.get_webview_window("main") {
        if let Ok(mhwnd) = main_win.hwnd() {
            if mhwnd.0 as isize == hwnd {
                return true;
            }
        }
    }
    false
}

#[cfg(not(target_os = "windows"))]
fn is_voiceflow_hwnd(_app: &AppHandle, _hwnd: isize) -> bool {
    false
}

#[tauri::command]
fn toggle_overlay(app: AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let is_visible = is_overlay_window_visible(&overlay);
        println!("[Rust Overlay] toggle_overlay called. is_visible: {}", is_visible);

        if is_visible {
            #[cfg(target_os = "windows")]
            keyboard_hook::set_hook_active(false);
            hide_overlay_window(&overlay);
            let state = app.state::<AppState>();
            if let Ok(mut guard) = state.previous_hwnd.lock() {
                if let Some(hwnd) = guard.take() {
                    if !is_voiceflow_hwnd(&app, hwnd) {
                        println!("[Rust Overlay] Restoring foreground window on toggle: {:x}", hwnd);
                        restore_foreground_window(hwnd);
                    }
                }
            }
            let _ = overlay.emit("overlay:toggle", ());
            let _ = app.emit("overlay:toggle", ());
        } else {
            let state = app.state::<AppState>();
            let current_hwnd = get_foreground_window();

            if let Some(hwnd) = current_hwnd {
                if !is_voiceflow_hwnd(&app, hwnd) {
                    println!("[Rust Overlay] Captured external foreground window before showing: {:x}", hwnd);
                    if let Ok(mut guard) = state.previous_hwnd.lock() {
                        *guard = Some(hwnd);
                    }
                } else {
                    println!("[Rust Overlay] Active window is VoiceFlow itself, clearing previous_hwnd");
                    if let Ok(mut guard) = state.previous_hwnd.lock() {
                        *guard = None;
                    }
                }
            }

            #[cfg(target_os = "windows")]
            keyboard_hook::set_hook_active(true);
            overlay.center().ok();

            show_overlay_window(&overlay);

            let _ = overlay.emit("overlay:show", ());
            let _ = app.emit("overlay:show", ());
        }
    } else {
        println!("[Rust Overlay] WARNING: overlay window not found in app!");
    }
}

#[tauri::command]
fn show_overlay(app: AppHandle) {
    println!("[Rust Overlay] show_overlay command called");
    if let Some(overlay) = app.get_webview_window("overlay") {
        let state = app.state::<AppState>();
        let current_hwnd = get_foreground_window();

        if let Some(hwnd) = current_hwnd {
            if !is_voiceflow_hwnd(&app, hwnd) {
                println!("[Rust Overlay] Captured external foreground window: {:x}", hwnd);
                if let Ok(mut guard) = state.previous_hwnd.lock() {
                    *guard = Some(hwnd);
                }
            } else {
                println!("[Rust Overlay] Active window is VoiceFlow itself, clearing previous_hwnd");
                if let Ok(mut guard) = state.previous_hwnd.lock() {
                    *guard = None;
                }
            }
        }

        #[cfg(target_os = "windows")]
        keyboard_hook::set_hook_active(true);
        overlay.center().ok();

        show_overlay_window(&overlay);

        let _ = overlay.emit("overlay:show", ());
        let _ = app.emit("overlay:show", ());
    }
}

#[tauri::command]
fn hide_overlay(app: AppHandle) {
    println!("[Rust Overlay] hide_overlay command called");
    #[cfg(target_os = "windows")]
    keyboard_hook::set_hook_active(false);

    if let Some(overlay) = app.get_webview_window("overlay") {
        hide_overlay_window(&overlay);
    }

    let state = app.state::<AppState>();
    if let Ok(mut guard) = state.previous_hwnd.lock() {
        if let Some(hwnd) = guard.take() {
            if !is_voiceflow_hwnd(&app, hwnd) {
                println!("[Rust Overlay] Restoring foreground window: {:x}", hwnd);
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
fn get_autostart_status() -> bool {
    autostart::is_autostart_enabled()
}

#[tauri::command]
fn set_autostart_status(app: AppHandle, enabled: bool) -> Result<bool, String> {
    let status = autostart::set_autostart(enabled)?;
    tray::update_tray_autostart(&app, status);
    let _ = app.emit("autostart-changed", status);
    Ok(status)
}

#[tauri::command]
fn get_wake_word_config(app: AppHandle) -> wake_word::WakeWordConfig {
    let state = app.state::<AppState>();
    if let Ok(service) = state.wake_word_service.lock() {
        service.get_config()
    } else {
        wake_word::WakeWordConfig::default()
    }
}

#[tauri::command]
fn set_wake_word_config(app: AppHandle, config: wake_word::WakeWordConfig) -> Result<wake_word::WakeWordConfig, String> {
    let state = app.state::<AppState>();
    if let Ok(mut service) = state.wake_word_service.lock() {
        service.set_config(&app, config.clone());
        let _ = app.emit("wake-word:config-changed", &config);
        Ok(config)
    } else {
        Err("Failed to acquire lock on wake word service".to_string())
    }
}

#[tauri::command]
fn start_wake_word_calibration(app: AppHandle, phrase: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    if let Ok(mut service) = state.wake_word_service.lock() {
        service.start_calibration(&app, &phrase);
        Ok(())
    } else {
        Err("Failed to acquire lock on wake word service".to_string())
    }
}

#[tauri::command]
fn record_wake_word_calibration_step(app: AppHandle, phrase: String, step_index: usize) -> Result<serde_json::Value, String> {
    let state = app.state::<AppState>();
    if let Ok(mut service) = state.wake_word_service.lock() {
        service.record_calibration_step(&app, phrase, step_index)
    } else {
        Err("Failed to acquire lock on wake word service".to_string())
    }
}

#[tauri::command]
fn cancel_wake_word_calibration(app: AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    if let Ok(mut service) = state.wake_word_service.lock() {
        service.cancel_calibration();
        Ok(())
    } else {
        Err("Failed to acquire lock on wake word service".to_string())
    }
}

#[tauri::command]
fn get_wake_word_enrollment(app: AppHandle) -> Result<serde_json::Value, String> {
    let state = app.state::<AppState>();
    if let Ok(service) = state.wake_word_service.lock() {
        Ok(service.get_enrolled_status())
    } else {
        Err("Failed to acquire lock on wake word service".to_string())
    }
}

#[tauri::command]
fn reset_wake_word_enrollment(app: AppHandle, phrase: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    if let Ok(mut service) = state.wake_word_service.lock() {
        service.reset_enrollment(&phrase)
    } else {
        Err("Failed to acquire lock on wake word service".to_string())
    }
}

#[tauri::command]
fn get_wake_word_preroll_audio(app: AppHandle) -> Option<Vec<u8>> {
    let state = app.state::<AppState>();
    if let Ok(service) = state.wake_word_service.lock() {
        service.get_preroll_audio()
    } else {
        None
    }
}

#[tauri::command]
fn set_wake_word_os_suspended(app: AppHandle, suspended: bool) {
    let state = app.state::<AppState>();
    if let Ok(service) = state.wake_word_service.lock() {
        if suspended {
            service.pause_for_os_lock();
        } else {
            service.resume_from_os_lock();
        }
    }
}

#[tauri::command]
fn insert_text(app: AppHandle, text: String) -> Result<(), String> {
    println!("[Rust Insert] insert_text command called. Text length: {}", text.len());
    #[cfg(target_os = "windows")]
    keyboard_hook::set_hook_active(false);
    let state = app.state::<AppState>();
    let previous_hwnd = {
        let mut guard = state.previous_hwnd.lock().map_err(|e| e.to_string())?;
        guard.take()
    };

    if let Some(overlay) = app.get_webview_window("overlay") {
        hide_overlay_window(&overlay);
    }

    app.clipboard()
        .write_text(&text)
        .map_err(|e| e.to_string())?;

    if let Some(hwnd) = previous_hwnd {
        if !is_voiceflow_hwnd(&app, hwnd) {
            println!("[Rust Insert] Restoring foreground target window: {:x}", hwnd);
            restore_foreground_window(hwnd);
            std::thread::sleep(std::time::Duration::from_millis(60));
            insertion::simulate_paste();
            println!("[Rust Insert] simulate_paste completed successfully");
        } else {
            println!("[Rust Insert] Target window is VoiceFlow itself; skipping restore and paste simulation");
        }
    } else {
        println!("[Rust Insert] No previous_hwnd captured; skipping restore and paste simulation");
    }

    Ok(())
}

fn is_dictation_shortcut(shortcut: &Shortcut) -> bool {
    #[cfg(target_os = "macos")]
    {
        // On macOS: Avoid Command+Space (which is hardwired to Spotlight / Siri)
        // Support Option+Space (Alt+Space) and Control+Space
        if let Ok(target) = Shortcut::from_str("Alt+Space") {
            if shortcut == &target {
                return true;
            }
        }
        if let Ok(target) = Shortcut::from_str("Control+Space") {
            if shortcut == &target {
                return true;
            }
        }
        false
    }
    #[cfg(not(target_os = "macos"))]
    {
        if let Ok(target) = Shortcut::from_str("Control+Space") {
            if shortcut == &target {
                return true;
            }
        }
        false
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "windows")]
    unsafe {
        std::env::set_var("WEBVIEW2_DEFAULT_BACKGROUND_COLOR", "0");
    }

    tauri::Builder::default()
        .manage(AppState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if is_dictation_shortcut(shortcut) {
                            toggle_overlay(app.clone());
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

            // Ensure autostart on Windows startup is enabled by default on initial launch
            autostart::init_default_autostart();

            // Initialize System Tray
            if let Err(e) = tray::create_tray(app.handle()) {
                eprintln!("[Tray] Error creating system tray: {}", e);
            }

            if let Some(overlay) = app.get_webview_window("overlay") {
                let _ = overlay.set_shadow(false);
                #[cfg(target_os = "windows")]
                if let Ok(hwnd) = overlay.hwnd() {
                    make_window_non_activating(hwnd.0 as isize);

                    // Remove native Windows 11 DWM borders and rectangular frames on the transparent overlay window
                    use windows_sys::Win32::Graphics::Dwm::{DwmSetWindowAttribute, DWMWA_BORDER_COLOR};
                    unsafe {
                        // 0xFFFFFFFE is DWMWA_COLOR_NONE (disables the window border in Windows 11)
                        let border_color: u32 = 0xFFFFFFFE;
                        let _ = DwmSetWindowAttribute(
                            hwnd.0 as _,
                            DWMWA_BORDER_COLOR as u32,
                            &border_color as *const _ as *const std::ffi::c_void,
                            std::mem::size_of::<u32>() as u32,
                        );
                    }
                }
            }
            #[cfg(target_os = "macos")]
            {
                // Register both Option+Space and Control+Space on macOS to never collide with Spotlight (Cmd+Space)
                if let Ok(shortcut) = Shortcut::from_str("Alt+Space") {
                    let _ = app.global_shortcut().register(shortcut);
                }
                if let Ok(shortcut) = Shortcut::from_str("Control+Space") {
                    let _ = app.global_shortcut().register(shortcut);
                }
            }
            #[cfg(not(target_os = "macos"))]
            {
                if let Ok(shortcut) = Shortcut::from_str("Control+Space") {
                    let _ = app.global_shortcut().register(shortcut);
                }
            }
            #[cfg(target_os = "windows")]
            keyboard_hook::init_keyboard_hook(app.handle().clone());

            let args: Vec<String> = std::env::args().collect();
            let is_minimized = args.iter().any(|arg| arg == "--minimized" || arg == "--autostart");
            if is_minimized {
                if let Some(main_win) = app.get_webview_window("main") {
                    let _ = main_win.hide();
                    println!("[Startup] Launched minimized to tray on system boot");
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                    println!("[Window] Main window close intercepted; minimized to system tray");
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            show_overlay,
            hide_overlay,
            toggle_overlay,
            get_active_context,
            insert_text,
            get_autostart_status,
            set_autostart_status,
            get_wake_word_config,
            set_wake_word_config,
            start_wake_word_calibration,
            record_wake_word_calibration_step,
            cancel_wake_word_calibration,
            get_wake_word_enrollment,
            reset_wake_word_enrollment,
            get_wake_word_preroll_audio,
            set_wake_word_os_suspended
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                let state = app_handle.state::<AppState>();
                if let Ok(mut service) = state.wake_word_service.lock() {
                    service.stop_listening();
                }
                if let Ok(mut guard) = state.server_process.lock() {
                    if let Some(mut child) = guard.take() {
                        server_manager::stop_server(&mut child);
                    }
                }
            }
        });
}
