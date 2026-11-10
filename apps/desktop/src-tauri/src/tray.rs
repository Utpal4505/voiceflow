use std::sync::Mutex;
use tauri::{
    menu::{CheckMenuItem, CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

static AUTOSTART_ITEM: Mutex<Option<CheckMenuItem<tauri::Wry>>> = Mutex::new(None);

pub fn create_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let open_item = MenuItemBuilder::with_id("open", "Open VoiceFlow").build(app)?;

    #[cfg(target_os = "macos")]
    let toggle_label = "Toggle Dictation (Option+Space / Ctrl+Space)";
    #[cfg(not(target_os = "macos"))]
    let toggle_label = "Toggle Dictation (Ctrl+Space)";

    let toggle_item = MenuItemBuilder::with_id("toggle", toggle_label).build(app)?;

    let autostart_enabled = crate::autostart::is_autostart_enabled();

    #[cfg(target_os = "windows")]
    let autostart_label = "Start with Windows";
    #[cfg(target_os = "macos")]
    let autostart_label = "Start at Login";
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    let autostart_label = "Start on System Boot";

    let autostart_item = CheckMenuItemBuilder::with_id("autostart", autostart_label)
        .checked(autostart_enabled)
        .build(app)?;

    if let Ok(mut guard) = AUTOSTART_ITEM.lock() {
        *guard = Some(autostart_item.clone());
    }

    let update_item = MenuItemBuilder::with_id("check_updates", "Check for Updates...").build(app)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quit VoiceFlow").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&open_item, &toggle_item, &autostart_item, &update_item, &separator, &quit_item])
        .build()?;

    let mut tray_builder = TrayIconBuilder::with_id("main_tray")
        .menu(&menu)
        .tooltip("VoiceFlow - Voice Typing")
        .show_menu_on_left_click(false);

    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.clone());
    }

    tray_builder
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
            "toggle" => {
                crate::trigger_toggle_overlay(app.clone());
            }
            "autostart" => {
                let current = crate::autostart::is_autostart_enabled();
                let new_state = !current;
                let _ = crate::autostart::set_autostart(new_state);
                let _ = app.emit("autostart-changed", new_state);
            }
            "check_updates" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                    let _ = window.emit("check-for-updates", ());
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let is_visible = window.is_visible().unwrap_or(false);
                    if is_visible {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    println!("[Tray] System tray initialized successfully");
    Ok(())
}

pub fn update_tray_autostart(_app: &AppHandle, enabled: bool) {
    if let Ok(guard) = AUTOSTART_ITEM.lock() {
        if let Some(item) = guard.as_ref() {
            let _ = item.set_checked(enabled);
        }
    }
}
